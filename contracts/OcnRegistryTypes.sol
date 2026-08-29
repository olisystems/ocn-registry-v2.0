// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

abstract contract OcnRegistryTypes {
    enum Role {
        CPO,
        EMSP,
        NAP,
        NSP,
        OTHER,
        SCSP,
        HUB
    }

    struct RoleDetails {
        bytes certificateData;
        bytes signature;
        Role role;
    }
}
