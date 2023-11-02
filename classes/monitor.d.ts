import { IRectangle } from "../interfaces";
export declare class Monitor {
    id: number;
    constructor(id: number);
    getBounds(): IRectangle;
    getWorkArea(): IRectangle;
    isPrimary(): boolean;
    getScaleFactor(): number;
    isValid(): boolean;
}
