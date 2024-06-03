import {ReactNode} from "react";

export type FooterColumnProps = {
    children: ReactNode;
    [key: string]: unknown;
}

export function FooterColumn({children}: FooterColumnProps) {
    return (
        <div className="pl-[15vw] pr-[15vw] flex-1 min-w-40">
            {children}
        </div>
    );
}
