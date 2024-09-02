// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./IOcnPaymentManager.sol";


// TODO uncoment to transform in upgradebles
// import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
// import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
// TODO remove to transrom in upgradeble
import "@openzeppelin/contracts/access/AccessControl.sol";


// TODO uncoment to transform in upgradebles
//contract OcnRegistry is Initializable, AccessControlUpgradeable, UUPSUpgradeable {

// TODO remove to transform in upgradeble
contract OcnRegistry is AccessControl { 
   
    /* ********************************** */
    /*       STORAGE VARIABLES            */
    /* ********************************** */

    //storage reserve for future variables
     // TODO uncoment to transform in upgradebles
    // uint256[50] __gap;
    // bytes32 public UPGRADER_ROLE;
    // uint public version;
    // address currentBaseContract;
    string private prefix;

   

    /// TODO uncoment for upgradebles
    /// @custom:oz-upgrades-unsafe-allow constructor
    // constructor() {
    //     _disableInitializers();
    // }


    // OCN Node Operator Listings
    mapping(address => string) private nodeOf;
    mapping(string => bool) private uniqueDomains;
    mapping(address => bool) private uniqueOperators;
    address[] private operators;

    // OCPI Party Listings
    enum Role { CPO, EMSP, HUB, NAP, NSP, OTHER, SCSP }
    enum Module { cdrs, chargingprofiles, commands, locations, sessions, tariffs, tokens }


    enum VcStatus { NOT_VERIFIED, APPROVED, FAILED }

    struct PartyDetails {
        bytes2 countryCode;
        bytes3 partyId;
        Role[] roles;
        string name;
        string url;
        IOcnPaymentManager.PaymentStatus paymentStatus;
        VcStatus vcStatus;
        bool active;
    }

    mapping(bytes2 => mapping(bytes3 => address)) private uniqueParties;
    mapping(address => bool) private uniquePartyAddresses;
    mapping(address => PartyDetails) private partyOf;
    mapping(address => address) private operatorOf;
    address[] private parties;

    IOcnPaymentManager public paymentManager;

    /* ********************************** */
    /*               EVENTS               */
    /* ********************************** */

    event OperatorUpdate(address indexed operator, string domain);
    event PartyUpdate(
        bytes2 countryCode,
        bytes3 partyId,
        address indexed partyAddress,
        Role[] roles,
        address indexed operatorAddress
    );

    /* ********************************** */
    /*          INITIALIZER               */
    /* ********************************** */
    // used as constructor in upgradeble contracts
    // TOEO uncoment for upgradebles
    // function initialize(address _paymentManager) public initializer {
    //     prefix = "\u0019Ethereum Signed Message:\n32";
    //     paymentManager = IOcnPaymentManager(_paymentManager);
    //     UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    //     __AccessControl_init();
    //     __UUPSUpgradeable_init();

    //     _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    //     _grantRole(UPGRADER_ROLE, msg.sender);
    // }

     // TODO remove for upgradebles
    constructor (address _paymentManager){
        prefix = "\u0019Ethereum Signed Message:\n32";
        paymentManager = IOcnPaymentManager(_paymentManager);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * Called when Base Contract upgrades: iterate version   
     */
     // TODO uncoment for upgradebles
    // function _authorizeUpgrade(address newImplementation)
    //     internal
    //     onlyRole(UPGRADER_ROLE)
    //     override
    // {
    //     currentBaseContract = newImplementation;
    //     version++;
    // }

    /* ********************************** */
    /*            FUNCTIONS               */
    /* ********************************** */

    // To be used on deploy to transfer ownership from the deployer address to the Timelock Contract address
    function transferOwnership(address newOwner) public onlyRole(DEFAULT_ADMIN_ROLE) {
        // Grant DEFAULT_ADMIN_ROLE to new owner
        grantRole(DEFAULT_ADMIN_ROLE, newOwner);
        // Revoke DEFAULT_ADMIN_ROLE from current owner
        revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }


    function adminDeleteOperator(address operator) public onlyRole(DEFAULT_ADMIN_ROLE) {
        deleteNode(operator);
    }

    function adminDeleteParty(bytes2 countryCode, bytes3 partyId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        address party = uniqueParties[countryCode][partyId];
        deleteParty(party);
    }

    function setNode(address operator, string memory domain) private {
        require(bytes(domain).length != 0, "Cannot set empty domain name. Use deleteNode method instead.");
        require(uniqueDomains[domain] == false, "Domain name already registered.");
        uniqueDomains[domain] = true;

        if (uniqueOperators[operator] == false) {
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
        require(bytes(domain).length > 0, "Cannot delete node that does not exist.");
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
        require(countryCode != bytes2(0), "Cannot set empty country_code. Use deleteParty method instead.");
        require(partyId != bytes3(0), "Cannot set empty party_id. Use deleteParty method instead.");
        require(roles.length > 0, "No roles provided.");
        require(operator != address(0), "Cannot set empty operator. Use deleteParty method instead.");

        address registeredParty = uniqueParties[countryCode][partyId];
        require(
            registeredParty == address(0) || registeredParty == party,
            "Party with country_code/party_id already registered under different address."
        );
        uniqueParties[countryCode][partyId] = party;

        require(bytes(nodeOf[operator]).length != 0, "Provided operator not registered.");

        if (uniquePartyAddresses[party] == false) {
            parties.push(party);
        }

        uniquePartyAddresses[party] = true;

        IOcnPaymentManager.PaymentStatus paymentStatus = paymentManager.getPaymentStatus(party);

        partyOf[party] = PartyDetails(countryCode, partyId, roles, name, url, paymentStatus, VcStatus.NOT_VERIFIED, true);
        operatorOf[party] = operator;

        emit PartyUpdate(countryCode, partyId, party, roles, operator);
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
        bytes32 paramHash = keccak256(abi.encodePacked(party, countryCode, partyId, roles, operator));
        address signer = ecrecover(keccak256(abi.encodePacked(prefix, paramHash)), v, r, s);
        require(signer == party, "Signer and provided party address different.");
        setParty(signer, countryCode, partyId, roles, operator, name, url);
    }

    function deleteParty(address party) private {
        require(operatorOf[party] != address(0), "Cannot delete party that does not exist. No operator found for given party.");
        delete operatorOf[party];
        PartyDetails memory details = partyOf[party];
        delete uniqueParties[details.countryCode][details.partyId];
        delete partyOf[party];

        Role[] memory emptyRoles;
        emit PartyUpdate(details.countryCode, details.partyId, party, emptyRoles, address(0));
    }

    function deleteParty() public {
        deleteParty(msg.sender);
    }

    function deletePartyRaw(
        address party,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        bytes32 paramHash = keccak256(abi.encodePacked(party));
        address signer = ecrecover(keccak256(abi.encodePacked(prefix, paramHash)), v, r, s);
        require(signer == party, "Signer and provided party address different.");
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

    function getPartyDetailsByAddress(address partyAddress) public view returns (
        bytes2 countryCode,
        bytes3 partyId,
        Role[] memory roles,
        address operatorAddress,
        string memory operatorDomain
    ) {
        PartyDetails memory details = partyOf[partyAddress];
        countryCode = details.countryCode;
        partyId = details.partyId;
        roles = details.roles;
        operatorAddress = operatorOf[partyAddress];
        operatorDomain = nodeOf[operatorAddress];
    }

    function getPartyDetailsByOcpi(bytes2 countryCode, bytes3 partyId) public view returns (
        address partyAddress,
        Role[] memory roles,
        address operatorAddress,
        string memory operatorDomain
    ) {
        partyAddress = uniqueParties[countryCode][partyId];
        PartyDetails memory details = partyOf[partyAddress];
        roles = details.roles;
        operatorAddress = operatorOf[partyAddress];
        operatorDomain = nodeOf[operatorAddress];
    }

    function getParties() public view returns (address[] memory) {
        return parties;
    }

    function updatePaymentStatus(address party) external {
        require(msg.sender == address(paymentManager), "Unauthorized: only OcnPaymentManager can update payment status");
        IOcnPaymentManager.PaymentStatus paymentStatus = paymentManager.getPaymentStatus(party);
        partyOf[party].paymentStatus = paymentStatus;
    }
}