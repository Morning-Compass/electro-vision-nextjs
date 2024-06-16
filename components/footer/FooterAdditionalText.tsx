import {ReactNode} from "react";
import Link from "next/link";


export type FooterAdditionalTextProps = {
    children: ReactNode;
    link?: string | undefined;
    [key: string]: unknown;
}

export function FooterAdditionalText({children, link = undefined, ...props}: FooterAdditionalTextProps) {
    return (
        <Link className="duration-300 hover:text-emerald-500 break-words flex-1" href={link ?? ""} {...props}>
            {children}
        </Link>
    );
}
