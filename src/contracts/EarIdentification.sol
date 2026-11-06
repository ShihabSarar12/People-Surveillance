// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EarIdentification
 * @notice Department-based isolation for IPFS image CIDs with pagination.
 * @dev Admin (backend) assigns roles & departments, and registers CIDs to a department.
 *      Dept members can ONLY list/read their own department dataset (paginated).
 *      Admin/Special can list/read any department dataset (paginated).
 */
contract EarIdentification {
    enum Role {
        NONE,
        DEPT_USER,
        AUDITOR,
        SPECIAL
    }

    enum Department {
        NONE,
        CSE,
        EEE,
        ME
    }

    address public immutable admin;

    mapping(address => Role) public roles;
    mapping(address => Department) public departmentOf;

    struct ImageMeta {
        string cid;
        uint256 timestamp;
        address registrar;
        Department department;
    }

    ImageMeta[] private imageLog;

    mapping(Department => uint256[]) private deptToImageIndices;

    mapping(bytes32 => uint256) private indexByCidHash;

    event RoleUpdated(address indexed entity, Role role);
    event DepartmentUpdated(address indexed entity, Department department);
    event ImageRegistered(
        uint256 indexed index,
        Department indexed department,
        string cid,
        uint256 timestamp,
        address indexed registrar
    );

    modifier onlyAdmin() {
        require(
            msg.sender == admin || roles[msg.sender] == Role.SPECIAL,
            "Not admin"
        );
        _;
    }

    modifier onlyAuthorized() {
        require(roles[msg.sender] != Role.NONE, "Not authorized");
        _;
    }

    modifier onlyDeptMember() {
        Department d = departmentOf[msg.sender];
        require(d != Department.NONE, "No department assigned");
        _;
    }

    constructor() {
        admin = msg.sender;
        roles[msg.sender] = Role.SPECIAL;
        emit RoleUpdated(msg.sender, Role.SPECIAL);
    }

    function setRole(address entity, Role role_) external onlyAdmin {
        roles[entity] = role_;
        emit RoleUpdated(entity, role_);
    }

    function setDepartment(address entity, Department dept) external onlyAdmin {
        departmentOf[entity] = dept;
        emit DepartmentUpdated(entity, dept);
    }

    /**
     * @notice Admin/backend registers an image CID into a department dataset.
     * @dev Enforces global CID uniqueness (a CID can exist in only one dept).
     */
    function registerImageToDepartment(
        string calldata cid,
        Department dept
    ) external onlyAdmin {
        require(dept != Department.NONE, "Invalid department");
        require(bytes(cid).length != 0, "Empty CID");

        bytes32 h = keccak256(bytes(cid));
        require(indexByCidHash[h] == 0, "CID already registered");

        uint256 ts = block.timestamp;

        imageLog.push(
            ImageMeta({
                cid: cid,
                timestamp: ts,
                registrar: msg.sender,
                department: dept
            })
        );

        uint256 index = imageLog.length - 1;

        deptToImageIndices[dept].push(index);
        indexByCidHash[h] = index + 1;

        emit ImageRegistered(index, dept, cid, ts, msg.sender);
    }

    /**
     * @notice Dept member: how many images are in MY department dataset.
     */
    function myDepartmentImageCount()
        external
        view
        onlyAuthorized
        onlyDeptMember
        returns (uint256)
    {
        return deptToImageIndices[departmentOf[msg.sender]].length;
    }

    /**
     * @notice Dept member: list MY department CIDs paginated.
     * @param start starting position in department list (0-based)
     * @param limit max number of items to return
     * @return cids IPFS CIDs
     * @return globalIndices corresponding indices in the global imageLog
     */
    function getMyDepartmentCIDs(
        uint256 start,
        uint256 limit
    )
        external
        view
        onlyAuthorized
        onlyDeptMember
        returns (string[] memory cids, uint256[] memory globalIndices)
    {
        Department dept = departmentOf[msg.sender];
        uint256[] storage idxs = deptToImageIndices[dept];
        uint256 n = idxs.length;

        if (start >= n) {
            return (new string[](0), new uint256[](0));
        }

        uint256 end = start + limit;
        if (end > n) end = n;

        uint256 size = end - start;
        cids = new string[](size);
        globalIndices = new uint256[](size);

        for (uint256 i = 0; i < size; i++) {
            uint256 globalIndex = idxs[start + i];
            globalIndices[i] = globalIndex;
            cids[i] = imageLog[globalIndex].cid;
        }
    }

    /**
     * @notice Admin/Special: count images in a specific department dataset.
     */
    function departmentImageCount(
        Department dept
    ) external view onlyAdmin returns (uint256) {
        require(dept != Department.NONE, "Invalid department");
        return deptToImageIndices[dept].length;
    }

    /**
     * @notice Admin/Special: list CIDs for a specific department (paginated).
     * @param dept which department dataset to read
     * @param start starting position in that department list (0-based)
     * @param limit max number of items to return
     * @return cids IPFS CIDs
     * @return globalIndices corresponding indices in the global imageLog
     */
    function getDepartmentCIDs(
        Department dept,
        uint256 start,
        uint256 limit
    )
        external
        view
        onlyAdmin
        returns (string[] memory cids, uint256[] memory globalIndices)
    {
        require(dept != Department.NONE, "Invalid department");

        uint256[] storage idxs = deptToImageIndices[dept];
        uint256 n = idxs.length;

        if (start >= n) {
            return (new string[](0), new uint256[](0));
        }

        uint256 end = start + limit;
        if (end > n) end = n;

        uint256 size = end - start;
        cids = new string[](size);
        globalIndices = new uint256[](size);

        for (uint256 i = 0; i < size; i++) {
            uint256 globalIndex = idxs[start + i];
            globalIndices[i] = globalIndex;
            cids[i] = imageLog[globalIndex].cid;
        }
    }
}
