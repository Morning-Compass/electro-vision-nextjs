import {ReactNode} from "react";

export type FooterBottomProps = {
    children: ReactNode;
    [key: string]: unknown;
}

export function FooterBottom({children}: FooterBottomProps) {
    return (
        <div className="flex items-center mt-1.5 p-4">
            {children}
        </div>
    );
}