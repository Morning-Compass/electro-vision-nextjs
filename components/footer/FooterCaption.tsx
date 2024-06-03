import {ReactNode} from "react";

export type FooterCaptionProps = {
    children: ReactNode;
    [key: string]: unknown;
}

export function FooterCaption({children}: FooterCaptionProps) {
    return (
        <div className="flex flex-wrap mt-2 order-none">
            {children}
        </div>
    );
}
