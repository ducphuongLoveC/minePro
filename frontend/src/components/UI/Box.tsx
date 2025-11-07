import { ElementType, ComponentPropsWithoutRef } from 'react';
import clsx from 'clsx';

type BoxProps<T extends ElementType = 'div'> = {
    as?: T;
    children?: React.ReactNode;
    className?: string;
    variant?: string;
} & ComponentPropsWithoutRef<T>;

const baseStyles: Record<string, string> = {
    div: 'mb-4 p-3 bg-gray-200 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm',
    section: 'mb-4 p-3 bg-gray-100 border border-gray-400 rounded',
    button: 'active:border-t-gray-500 active:border-l-gray-500 active:border-b-white active:border-r-white px-3 py-1 bg-gray-300 text-gray-800 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400 text-sm rounded-sm',
    input: 'px-2 py-1 border border-gray-400 bg-white text-sm mb-2 rounded-sm',
    boxChild: 'mb-4 p-1 bg-gray-300 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm', 
    varButton: 'active:border-t-gray-500 active:border-l-gray-500 active:border-b-white active:border-r-white mb-4 p-3 bg-gray-300 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm'
};

export function Box<T extends ElementType = 'div'>({
    as,
    children,
    className,
    variant,
    ...props
}: BoxProps<T>) {
    const Element : any = as || 'div';
    const elementTag = typeof Element === 'string' ? Element : 'div';

    return (
        <Element
            className={clsx(baseStyles[variant || elementTag], className)}
            {...props}
        >
            {children}
        </Element>
    );
}
