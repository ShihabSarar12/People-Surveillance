import { RowDataPacket } from 'mysql2';

type TableRow = {
    [key: string]: string;
} & RowDataPacket;

export default TableRow;
