import { ReactNode } from "react";
import Link from "next/link";


export type FooterSectionElementProps = {
    children: ReactNode;
    link?: string | undefined;
    [key: string]: unknown;
}

export function FooterSectionElement({children, link = undefined, ...props}: FooterSectionElementProps) {
    return (
        <Link className="duration-300 hover:text-emerald-500" href={link ?? ""} {...props}>
            {children}
        </Link>
    );
}
