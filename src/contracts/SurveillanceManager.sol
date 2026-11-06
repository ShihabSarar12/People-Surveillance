// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SurveillanceManager
 * @notice Stores tamper-proof encrypted surveillance metadata (IPFS CIDs)
 *      on a private Ethereum chain with QBFT consensus.
 * @dev Designed for integration with IPFS + off-chain KMS/TEE as in the paper.
 */
contract SurveillanceManager {
    enum Role {
        NONE,
        EDGE_DEVICE,
        LAW_ENFORCEMENT,
        AUDITOR,
        SPECIAL
    }

    /// @notice Contract admin (deployer) who can assign roles.
    address public immutable admin;

    /// @notice Mapping of addresses to their assigned role.
    mapping(address => Role) public roles;

    struct Metadata {
        string cid;
        uint256 timestamp;
        address uploader;
    }

    /// @notice Append-only log of all anchored metadata.
    Metadata[] public metadataLog;

    /**
     * @notice Index to efficiently look up metadata by (uploader, timestamp).
     * @dev Stores index+1 into metadataLog. 0 means "no entry".
     */
    mapping(address => mapping(uint256 => uint256))
        private metadataIndexByUploaderAndTimestamp;

    event RoleUpdated(address indexed entity, Role role);
    event MetadataAnchored(
        uint256 indexed index,
        string cid,
        address indexed uploader,
        uint256 timestamp
    );

    modifier onlyAdmin() {
        require(
            msg.sender == admin || roles[msg.sender] == Role.SPECIAL,
            "Not admin"
        );
        _;
    }

    modifier onlyRole(Role role_) {
        require(
            roles[msg.sender] == role_ || roles[msg.sender] == Role.SPECIAL,
            "Invalid role"
        );
        _;
    }

    modifier onlyAuthorized() {
        require(roles[msg.sender] != Role.NONE, "Not authorized");
        _;
    }

    modifier onlyReviewers() {
        require(
            roles[msg.sender] == Role.LAW_ENFORCEMENT ||
                roles[msg.sender] == Role.AUDITOR ||
                roles[msg.sender] == Role.SPECIAL,
            "Access denied"
        );
        _;
    }

    constructor() {
        admin = msg.sender;
        roles[msg.sender] = Role.AUDITOR;
        emit RoleUpdated(msg.sender, Role.AUDITOR);
    }

    /**
     * @notice Assign or update a role for an address.
     * @dev Only the admin can call this.
     * @param entity Stores address of the user whose role is being updated
     * @param role_ Updated role
     */
    function setRole(address entity, Role role_) external onlyAdmin {
        roles[entity] = role_;
        emit RoleUpdated(entity, role_);
    }

    /**
     * @notice Edge device anchors a new encrypted video/metadata CID.
     * @param cid IPFS CID of facial recognition annotated video payload.
     * @dev This function only stores the CID + basic metadata (timestamp, uploader).
     *      Enforces uniqueness of (uploader, timestamp) pair.
     * @dev Only Edge devices can call this function.
     */
    function storeCID(string calldata cid) external onlyRole(Role.EDGE_DEVICE) {
        uint256 ts = block.timestamp;

        require(
            metadataIndexByUploaderAndTimestamp[msg.sender][ts] == 0,
            "Entry already exists for uploader and timestamp"
        );

        Metadata memory m = Metadata({
            cid: cid,
            timestamp: ts,
            uploader: msg.sender
        });

        metadataLog.push(m);
        uint256 index = metadataLog.length - 1;

        metadataIndexByUploaderAndTimestamp[msg.sender][ts] = index + 1;

        emit MetadataAnchored(index, cid, msg.sender, ts);
    }

    /**
     * @notice Get CID by index for any authorized role (edge, LEA, auditor).
     * @dev Typically used by law enforcement or auditors to fetch CID.
     * @param index Stores the index of the metadataLog that is requested
     * @return cid the CID of annotated facial recognition video
     */
    function getCID(
        uint256 index
    ) external view onlyAuthorized returns (string memory) {
        require(index < metadataLog.length, "Index out of bounds");
        return metadataLog[index].cid;
    }

    /**
     * @notice Get full metadata entry (CID, timestamp, uploader) by index.
     * @param index Stores the index of the metadataLog that is requested
     * @return cid the CID of annotated facial recognition video.
     * @return timestamp Timestamp stored in metadata.
     * @return uploader Uploader address in metadata.
     */
    function getMetadata(
        uint256 index
    )
        external
        view
        onlyReviewers
        returns (string memory cid, uint256 timestamp, address uploader)
    {
        require(index < metadataLog.length, "Index out of bounds");
        Metadata storage m = metadataLog[index];
        return (m.cid, m.timestamp, m.uploader);
    }

    /**
     * @notice Efficiently fetch metadata for a given (uploader, exact timestamp).
     * @param uploader Address that originally stored the CID.
     * @param timestamp Exact block timestamp used when storing.
     * @return cid IPFS CID
     * @return storedTimestamp Timestamp stored in metadata
     * @return storedUploader Uploader address in metadata
     */
    function getMetadataByUploaderAndTimestamp(
        address uploader,
        uint256 timestamp
    )
        external
        view
        onlyReviewers
        returns (
            string memory cid,
            uint256 storedTimestamp,
            address storedUploader
        )
    {
        uint256 storedIndexPlusOne = metadataIndexByUploaderAndTimestamp[
            uploader
        ][timestamp];

        require(
            storedIndexPlusOne != 0,
            "No metadata for uploader and timestamp"
        );

        uint256 index = storedIndexPlusOne - 1;
        require(index < metadataLog.length, "Corrupt index");

        Metadata storage m = metadataLog[index];
        return (m.cid, m.timestamp, m.uploader);
    }

    /// @notice Number of metadata entries stored so far.
    function metadataCount() external view returns (uint256) {
        return metadataLog.length;
    }
}
