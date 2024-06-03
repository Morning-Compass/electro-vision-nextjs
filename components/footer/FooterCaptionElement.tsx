import {ReactNode} from "react";
import Link from "next/link";


export type FooterCaptionElementProps = {
    children: ReactNode;
    link?: string | undefined;
    [key: string]: unknown;
}

export function FooterCaptionElement({children, link = undefined, ...props}: FooterCaptionElementProps) {
    return (
        <Link className="duration-300 mr-8 hover:text-emerald-500" href={link ?? ""} {...props}>
            {children}
        </Link>
    );
}
