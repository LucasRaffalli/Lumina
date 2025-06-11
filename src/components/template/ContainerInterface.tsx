import { Flex } from '@radix-ui/themes'
import React from 'react'

interface ContainerInterfaceProps {
    children?: React.ReactNode;
    justify?: "center" | "start" | "end" | "between";
    align?: "center" | "start" | "end" | "baseline" | "stretch";
    gap?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
    direction?: "row" | "row-reverse" | "column" | "column-reverse";
    height?: string;
    width?: string;
    pl?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
    pr?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
    pt?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
    pb?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
    padding?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
    margin?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "-1" | "-2" | "-3" | "-4" | "-5" | "-6" | "-7" | "-8" | "-9";
    className?: string;
    onClick?: () => void;
    maxHeight?: string;
    maxWidth?: string;
    overflow?: "hidden" | "auto" | "visible" | "clip" | "scroll";
}

export default function ContainerInterface({ children, overflow, align, gap, height, justify, direction, width, margin, padding, pl, pb, pr, pt, className, onClick, maxHeight, maxWidth }: ContainerInterfaceProps) {
    return (
        <Flex
            maxHeight={maxHeight}
            maxWidth={maxWidth}
            pl={pl}
            pr={pr}
            pt={pt}
            pb={pb}
            p={padding}
            m={margin}
            direction={direction}
            justify={justify}
            gap={gap}
            align={align}
            height={height}
            width={width}
            className={className}
            onClick={onClick}
            overflow={overflow}
            style={{ background: "var(--gray-1)", border: "1px solid var(--gray-6)", borderRadius: "var(--radius-4)" }}
        >
            {children}
        </Flex>
    )
}
