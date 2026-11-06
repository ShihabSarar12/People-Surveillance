const isValidCID = (cid: string): boolean => {
    const CIDV0_REGEX = /^Qm[1-9A-Za-z]{44}$/;
    const CIDV1_REGEX = /^[a-z0-9]{59}$/;

    if (!cid) return false;

    cid = cid.trim();
    if (CIDV0_REGEX.test(cid)) return true;
    if (CIDV1_REGEX.test(cid)) return true;

    return false;
};

export default isValidCID;
