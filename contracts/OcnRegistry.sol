// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {IOcnPaymentManager} from "./IOcnPaymentManager.sol";
import {IOcnCvManager} from "./IOcnCvManager.sol";

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";


contract OcnRegistry is AccessControl {

    /* ********************************** */
    /*       STORAGE VARIABLES            */
    /* ********************************** */

    string private prefix;

    // OCN Node Operator Listings
    mapping(address => string) private nodeOf;
    mapping(string => bool) private uniqueDomains;
    mapping(address => bool) private uniqueOperators;
    address[] private operators;

    // OCPI Party Listings
    enum Role { CPO, EMSP, HUB, NAP, NSP, OTHER, SCSP }
    enum Module { cdrs, chargingprofiles, commands, locations, sessions, tariffs, tokens }

    struct PartyDetails {
        bytes2 countryCode;
        bytes3 partyId;
        Role[] roles;
        string name;
        string url;
        IOcnPaymentManager.PaymentStatus paymentStatus;
        IOcnCvManager.CvStatus cvStatus;
        bool active;
        uint256 partyIndex;
    }

    mapping(bytes2 => mapping(bytes3 => address)) private uniqueParties;
    mapping(address => bool) private uniquePartyAddresses;
    mapping(address => PartyDetails) private partyOf;
    mapping(address => address) private operatorOf;
    address[] private parties;

    IOcnPaymentManager public paymentManager;

   
    /* ********************************** */
    /*          CUSTOM ERRORS             */
    /* ********************************** */
    error EmptyDomainName(string reason);
    error DomainNameAlreadyRegistered(string reason);
    error EmptyCountryCode(string reason);
    error EmptyPartyId(string reason);
    error NoRolesProvided(string reason);
    error EmptyOperator(string reason);
    error PartyAlreadyRegistered(string reason);
    error PartyNotRegistered(string reason);
    error SignerMismatch(string reason);

    /* ********************************** */
    /*               EVENTS               */
    /* ********************************** */

    event OwnershipTransferred(address indexed oldAdmin, address indexed newAdmin);
    event OperatorUpdate(address indexed operator, string domain);
    event PartyUpdate(
        bytes2 countryCode,
        bytes3 partyId,
        address indexed partyAddress,
        Role[] roles,
        string name,
        string url,
        IOcnPaymentManager.PaymentStatus paymentStatus,
        IOcnCvManager.CvStatus cvStatus,
        bool active,
        address indexed operatorAddress
    );

    event PartyDelete(
        bytes2 countryCode,
        bytes3 partyId,
        address indexed partyAddress,
        Role[] roles,
        string name,
        string url,
        IOcnPaymentManager.PaymentStatus paymentStatus,
        IOcnCvManager.CvStatus cvStatus,
        bool active
    );
    /* ********************************** */
    /*          INITIALIZER               */
    /* ********************************** */

    constructor(address _paymentManager) {
        prefix = "\u0019Ethereum Signed Message:\n32";
        paymentManager = IOcnPaymentManager(_paymentManager);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function transferOwnership(address newOwner) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(DEFAULT_ADMIN_ROLE, newOwner);
        revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);

        emit OwnershipTransferred(msg.sender, newOwner);
    }

    function adminDeleteOperator(address operator) public onlyRole(DEFAULT_ADMIN_ROLE) {
        deleteNode(operator);
    }

    function adminDeleteParty(bytes2 countryCode, bytes3 partyId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        address party = uniqueParties[countryCode][partyId];
        deleteParty(party);
    }

    function setNode(address operator, string memory domain) private {
        if (bytes(domain).length == 0) {
            revert EmptyDomainName("Cannot set empty domain name. Use deleteNode method instead.");
        }
        if (uniqueDomains[domain]) {
            revert DomainNameAlreadyRegistered("Domain name already registered.");
        }
        uniqueDomains[domain] = true;

        if (!uniqueOperators[operator]) {
            operators.push(operator);
        }

        uniqueOperators[operator] = true;
        nodeOf[operator] = domain;
        emit OperatorUpdate(operator, domain);
    }

    function setNode(string memory domain) public {
        setNode(msg.sender, domain);
    }

    function setNodeRaw(address operator, string memory domain, uint8 v, bytes32 r, bytes32 s) public {
        bytes32 paramHash = keccak256(abi.encodePacked(operator, domain));
        address signer = ecrecover(keccak256(abi.encodePacked(prefix, paramHash)), v, r, s);
        setNode(signer, domain);
    }

    function deleteNode(address operator) private {
        string memory domain = nodeOf[operator];
        if (bytes(domain).length == 0) {
            revert EmptyDomainName("Cannot delete node that does not exist.");
        }
        uniqueDomains[domain] = false;
        delete nodeOf[operator];
        emit OperatorUpdate(operator, "");
    }

    function deleteNode() public {
        deleteNode(msg.sender);
    }

    function deleteNodeRaw(address operator, uint8 v, bytes32 r, bytes32 s) public {
        bytes32 paramHash = keccak256(abi.encodePacked(operator));
        address signer = ecrecover(keccak256(abi.encodePacked(prefix, paramHash)), v, r, s);
        deleteNode(signer);
    }

    function getNode(address operator) public view returns (string memory) {
        return nodeOf[operator];
    }

    function getNodeOperators() public view returns (address[] memory) {
        return operators;
    }

    function setParty(
        address party,
        bytes2 countryCode,
        bytes3 partyId,
        Role[] memory roles,
        address operator,
        string memory name,
        string memory url
    ) private {
        if (countryCode == bytes2(0)) {
            revert EmptyCountryCode("Cannot set empty country_code. Use deleteParty method instead.");
        }
        if (partyId == bytes3(0)) {
            revert EmptyPartyId("Cannot set empty party_id. Use deleteParty method instead.");
        }
        if (roles.length == 0) {
            revert NoRolesProvided("No roles provided.");
        }
        if (operator == address(0)) {
            revert EmptyOperator("Cannot set empty operator. Use deleteParty method instead.");
        }

        address registeredParty = uniqueParties[countryCode][partyId];
        if (registeredParty != address(0) && registeredParty != party) {
            revert PartyAlreadyRegistered("Party with country_code/party_id already registered under different address.");
        }
        uniqueParties[countryCode][partyId] = party;
        if (bytes(nodeOf[operator]).length == 0) {
            revert PartyNotRegistered("Provided operator not registered.");
        }

        uint256 partyIndex = partyOf[party].partyIndex;
        if (!uniquePartyAddresses[party]) {
            parties.push(party);
            // get last index of the array
            partyIndex = parties.length - 1;
        } 

        uniquePartyAddresses[party] = true;

        IOcnPaymentManager.PaymentStatus paymentStatus = paymentManager.getPaymentStatus(party);  
        // TODO implmenet CV verification
        partyOf[party] = PartyDetails(countryCode, partyId, roles, name, url, paymentStatus, IOcnCvManager.CvStatus.NOT_VERIFIED, true, partyIndex);
        operatorOf[party] = operator;

        PartyDetails memory details = partyOf[party];
        emit PartyUpdate(details.countryCode, details.partyId, party, details.roles, details.name, details.url, details.paymentStatus, details.cvStatus, details.active, operator);
    }

    function setParty(
        bytes2 countryCode,
        bytes3 partyId,
        Role[] memory roles,
        address operator,
        string memory name,
        string memory url
    ) public {
        setParty(msg.sender, countryCode, partyId, roles, operator, name, url);
    }

    function setPartyRaw(
        address party,
        bytes2 countryCode,
        bytes3 partyId,
        Role[] memory roles,
        address operator,
        string memory name,
        string memory url,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        bytes32 paramHash = keccak256(abi.encodePacked(party, countryCode, partyId, roles, operator, name, url));
        address signer = ecrecover(keccak256(abi.encodePacked(prefix, paramHash)), v, r, s);
        if (signer != party) {
            revert SignerMismatch("Signer and provided party address different.");
        }
        setParty(signer, countryCode, partyId, roles, operator, name, url);
    }

    function deleteParty(address party) private {
        if (operatorOf[party] == address(0)) {
            revert PartyNotRegistered("Cannot delete party that does not exist. No operator found for given party.");
        }
        delete operatorOf[party];
        PartyDetails memory details = partyOf[party];
        delete uniqueParties[details.countryCode][details.partyId];
        delete partyOf[party];
        delete parties[details.partyIndex];
        uniquePartyAddresses[party] = false;

        emit PartyDelete(details.countryCode, details.partyId, party, details.roles, details.name, details.url, details.paymentStatus, details.cvStatus, details.active);

    }

    function deleteParty() public {
        deleteParty(msg.sender);
    }

    function deletePartyRaw(address party, uint8 v, bytes32 r, bytes32 s) public {
        bytes32 paramHash = keccak256(abi.encodePacked(party));
        address signer = ecrecover(keccak256(abi.encodePacked(prefix, paramHash)), v, r, s);
        if (signer != party) {
            revert SignerMismatch("Signer and provided party address different.");
        }
        deleteParty(signer);
    }

    function getOperatorByAddress(address party) public view returns (address operator, string memory domain) {
        operator = operatorOf[party];
        domain = nodeOf[operator];
    }

    function getOperatorByOcpi(bytes2 countryCode, bytes3 partyId) public view returns (address operator, string memory domain) {
        address party = uniqueParties[countryCode][partyId];
        operator = operatorOf[party];
        domain = nodeOf[operator];
    }

    function getPartyDetailsByAddress(address _partyAddress) public view returns (
        address partyAddress,
        bytes2 countryCode,
        bytes3 partyId,
        Role[] memory roles,
        IOcnPaymentManager.PaymentStatus paymentStatus,
        address operatorAddress,
        string memory name,
        string memory url,
        bool active
    ) {
        PartyDetails storage details = partyOf[_partyAddress];
        partyAddress = _partyAddress;
        countryCode = details.countryCode;
        partyId = details.partyId;
        roles = details.roles;
        paymentStatus = details.paymentStatus;
        operatorAddress = operatorOf[_partyAddress];
        name = details.name;
        url = details.url;
        active = details.active;
    }

    function getPartyDetailsByOcpi(bytes2 _countryCode, bytes3 _partyId) public view returns (
        
        address partyAddress,
        bytes2 countryCode,
        bytes3 partyId,
        Role[] memory roles,
        IOcnPaymentManager.PaymentStatus paymentStatus,
        address operatorAddress,
        string memory name,
        string memory url,
        bool active
    ) {
        partyAddress = uniqueParties[_countryCode][_partyId];
        PartyDetails storage details = partyOf[partyAddress];
        countryCode = details.countryCode;
        partyId = details.partyId;
        roles = details.roles;
        paymentStatus = details.paymentStatus;
        operatorAddress = operatorOf[partyAddress];
        name = details.name;
        url = details.url;
        active = details.active;
    }

    function getPartiesCount() public view returns (uint256) {
        return parties.length;
    }

    function getParties() public view returns (address[] memory) {
        return parties;
    }

    function getPartiesByOperator(address operator) public view returns (address[] memory) {
        address[] memory filteredParties = new address[](parties.length);
        uint32 count = 0;
        for (uint32 i = 0; i < parties.length; i++) {
            if (operatorOf[parties[i]] == operator) {
                filteredParties[count] = parties[i];
                count++;
            }
        }
        address[] memory result = new address[](count);
        for (uint32 i = 0; i < count; i++) {
            result[i] = filteredParties[i];
        }
        return result;
    }

    function getPartiesByRole(Role role) public view returns (address[] memory) {
        address[] memory filteredParties = new address[](parties.length);
        uint32 count = 0;
        for (uint32 i = 0; i < parties.length; i++) {
            PartyDetails memory details = partyOf[parties[i]];
            for (uint32 j = 0; j < details.roles.length; j++) {
                if (details.roles[j] == role) {
                    filteredParties[count] = parties[i];
                    count++;
                    break;
                }
            }
        }
        address[] memory result = new address[](count);
        for (uint32 i = 0; i < count; i++) {
            result[i] = filteredParties[i];
        }
        return result;
    }

    
}
