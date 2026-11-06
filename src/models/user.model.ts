import { RowDataPacket } from 'mysql2';

type User = {
    id: number;
    name: string;
    email: string;
    password: string;
} & RowDataPacket;

export default User;
