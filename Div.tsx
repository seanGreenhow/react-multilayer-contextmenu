import * as React from "react"

export default class Div extends React.Component<{ hoverStyle?: React.CSSProperties } & React.HTMLAttributes<HTMLDivElement>, { hover: boolean }> {
    ref: HTMLDivElement;

    constructor(props: Readonly<{ hoverStyle: React.CSSProperties; } & React.HTMLAttributes<HTMLDivElement>>) {
        super(props)
        this.state = {
            hover: false
        }
    }

    render() {
        const { style, hoverStyle, onMouseEnter, onMouseLeave, children, ...rest } = this.props

        return (
            <div
                ref={ref => this.ref = ref}
                onMouseEnter={(e) => {
                    this.setState({ hover: true })
                    if (onMouseEnter) onMouseEnter(e)
                }}
                onMouseLeave={(e) => {
                    this.setState({ hover: false });
                    if (onMouseLeave) onMouseLeave(e)
                }}
                style={Object.assign({ pointerEvents: 'all' } as React.CSSProperties, style, this.state.hover ? hoverStyle : {})}
                {...rest}
            >
                {children}
            </div>
        )
    }
}