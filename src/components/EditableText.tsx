import { Text, TextField, Heading } from '@radix-ui/themes'
import { useState, useRef, useEffect } from 'react'

type RadixColor =
    | 'gray' | 'ruby' | 'gold' | 'bronze' | 'brown' | 'yellow' | 'amber'
    | 'orange' | 'tomato' | 'red' | 'crimson' | 'pink' | 'plum' | 'purple'
    | 'violet' | 'iris' | 'indigo' | 'blue' | 'cyan' | 'teal' | 'jade'
    | 'green' | 'grass' | 'lime' | 'mint' | 'sky'

type RadixSize = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
type EditableTextProps = {
    value: string
    onChange: (newValue: string) => void
    as?: 'text' | 'heading'
    color?: RadixColor
    size?: RadixSize
    className?: string
}

export default function EditableText({ value, onChange, as = 'text', color, size, className }: EditableTextProps) {
    const [editing, setEditing] = useState(false)
    const [tempValue, setTempValue] = useState(value)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (editing && inputRef.current) inputRef.current.focus()
    }, [editing])

    const CommonProps = {
        onDoubleClick: () => {
            setTempValue(value)
            setEditing(true)
        },
        ...(color ? { color } : {}),
        ...(size ? { size } : {}),
        ...(className ? { className } : {}),
        style: { cursor: 'pointer' },
    }

    return editing ? (
        <TextField.Root ref={inputRef} value={tempValue} onChange={(e) => setTempValue(e.target.value)}
            onBlur={() => {
                setEditing(false)
                if (tempValue !== value) onChange(tempValue)
            }} />
    ) : as === 'heading' ? (
        <Heading {...CommonProps} className='textItalic'>{value}</Heading>
    ) : (
        <Text {...CommonProps} className='textItalic'>{value}</Text>
    )
}
