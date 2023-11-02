import { Monitor } from "./monitor";
import { IRectangle } from "../interfaces";
import { EmptyMonitor } from "./empty-monitor";
export declare class Window {
    id: number;
    processId: number;
    path: string;
    constructor(id: number);
    getBounds(): IRectangle;
    setBounds(bounds: IRectangle): void;
    getTitle(): string;
    getMonitor(): Monitor | EmptyMonitor;
    show(): void;
    hide(): void;
    minimize(): void;
    restore(): void;
    maximize(): void;
    bringToTop(): void;
    redraw(): void;
    isWindow(): boolean;
    isVisible(): boolean;
    toggleTransparency(toggle: boolean): void;
    setOpacity(opacity: number): void;
    getOpacity(): any;
    setParent(window: Window | null | number): void;
    getOwner(): Window;
}
