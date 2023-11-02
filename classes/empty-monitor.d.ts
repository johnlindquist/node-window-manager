import { IRectangle } from "../interfaces";
export declare class EmptyMonitor {
    getBounds(): IRectangle;
    getWorkArea(): IRectangle;
    isPrimary(): boolean;
    getScaleFactor(): number;
    isValid(): boolean;
}
