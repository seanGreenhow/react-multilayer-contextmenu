import * as React from "react";
import { Layer, layerStyles, MultiLayer } from "react-multilayer";
import Div from "./Div";

type PropType<Type> = Type extends React.Component<infer P> ? P : never;
type ReactElement<Type> = React.ReactElement<PropType<Type>>;

export namespace Context {
  let currentContextMenu: ContextMenuObject = null;
  export function create(x: number, y: number) {
    currentContextMenu = new ContextMenuObject(x, y);
  }
  export function finalize() {
    const result = currentContextMenu;
    currentContextMenu = null;
    return result;
  }
  export function addEntry(entry: React.ReactNode) {
    if (currentContextMenu) currentContextMenu.addEntry(entry);
  }
}

class ContextMenuObject {
  entries: Array<React.ReactNode> = [];

  constructor(public x: number, public y: number) {}

  addEntry(entry: React.ReactNode) {
    this.entries.push(entry);
  }
}

class ContextCaptureLayer extends Layer<{ wrapper: MultilayerWithContext }> {
  render() {
    return (
      <div
        id="ContextCaptureLayer"
        style={layerStyles}
        ref={this.ref}
        onContextMenu={(e) => Context.create(e.clientX, e.clientY)}
        onClick={() => this.props.wrapper.closeContextMenu()}
      />
    );
  }
}

class ContextNotifierLayer extends Layer<{ wrapper: MultilayerWithContext }> {
  render() {
    return (
      <div
        id="ContextNotifierLayer"
        style={Object.assign({ pointerEvents: "all" }, layerStyles)}
        ref={this.ref}
        onContextMenu={(e) => {
          e.preventDefault();
          this.props.wrapper.setState({
            context: Context.finalize(),
            visible: true,
          });
        }}
      />
    );
  }
}

class ContextDrawLayer extends Layer<
  { context: ContextMenuObject } & MultilayerContextProps,
  ContextMenuState
> {
  render() {
    return (
      <div id="ContextDrawLayer" style={layerStyles} ref={this.ref}>
        <ContextMenu {...this.props} />
      </div>
    );
  }
}

interface ContextMenuState {
  x: number;
  y: number;
  transparent: boolean;
}
class ContextMenu extends React.Component<
  {
    context: ContextMenuObject;
    relativeElement?: HTMLElement;
    parent?: HTMLElement;
  } & MultilayerContextProps,
  ContextMenuState
> {
  div = React.createRef<Div>();

  constructor(props) {
    super(props);
    this.state = {
      x: 0,
      y: 0,
      transparent: true,
    };
  }

  updatePosition() {
    if (!this.div.current) return;

    let x = this.props.context.x;
    let y = this.props.context.y;

    let realX = x;
    let realY = y;

    let width = this.div.current.ref.current.offsetWidth;
    let height = this.div.current.ref.current.offsetHeight;

    if (this.props.parent) {
      const parentBox = this.props.parent.getBoundingClientRect();
      realX += parentBox.left;
      realY += parentBox.top;
    }

    if (realX + width > window.innerWidth) {
      if (this.props.relativeElement)
        width += this.props.relativeElement.offsetWidth;
      x -= width;
    }

    if (realY + height > window.innerHeight) {
      if (this.props.relativeElement)
        height -= this.props.relativeElement.offsetHeight;
      y -= height;
    }

    this.setState({ x, y, transparent: false });
  }

  componentDidMount() {
    this.updatePosition();
  }

  componentDidUpdate(prevProps: { context: ContextMenuObject }) {
    const needsUpdate = prevProps.context !== this.props.context;
    if (needsUpdate) this.updatePosition();
  }

  render() {
    if (this.props.context.entries.length == 0) return null;

    return (
      <Div
        ref={this.div}
        onClick={(e) => e.preventDefault()}
        style={Object.assign(
          {
            position: "absolute",
            top: this.state.y,
            left: this.state.x,
            visibility: this.state.transparent ? "hidden" : "visible",
            paddingTop: 3,
            paddingBottom: 3,
            borderRadius: 5,
            boxShadow: "0px 5px 20px -5px #000",
            backgroundColor: "rgb(60,60,60)",
            minWidth: 10,
          } as React.CSSProperties,
          this.props.menuStyle
        )}
        hoverStyle={this.props.menuHoverStyle}
      >
        {React.Children.map(
          this.props.context.entries,
          (element: ReactElement<ContextMenuEntry>) => {
            if (element && typeof element.type != "string") {
              if (
                element.type === ContextMenuEntry ||
                element.type.prototype instanceof ContextMenuEntry
              ) {
                return React.cloneElement(element, { parent: this });
              }
            }
            return element;
          }
        )}
      </Div>
    );
  }
}

class ContextMenuEntry<Props = {}, State = {}> extends React.Component<
  Props &
    MultilayerContextProps & {
      sort?: number;
      parent?: ContextMenu;
      children?: React.ReactNode;
    },
  State
> {}

const defaultEntryStyles: React.CSSProperties = {
  paddingLeft: 5,
  paddingRight: 5,
  paddingTop: 5,
  paddingBottom: 5,
  color: "white",
  whiteSpace: "nowrap",
};

export class ContextLabel extends ContextMenuEntry {
  render() {
    const { labelStyle } = this.props;
    return (
      <div
        style={Object.assign(
          {},
          defaultEntryStyles,
          {
            color: "rgba(255,255,255,0.5)",
          },
          labelStyle ? labelStyle : {}
        )}
      >
        {this.props.children}
      </div>
    );
  }
}

export class ContextSubmenu extends ContextMenuEntry<
  { label: React.ReactChild },
  { submenu: ContextMenuObject; hover: boolean }
> {
  div = React.createRef<Div>();

  constructor(props) {
    super(props);
    this.state = {
      hover: false,
      submenu: null,
    };
  }

  render() {
    const { submenuStyle, submenuHoverStyle } = this.props;

    return (
      <Div
        ref={this.div}
        style={Object.assign(
          {},
          defaultEntryStyles,
          {
            //group styles
          },
          submenuStyle ? submenuStyle : {}
        )}
        hoverStyle={Object.assign(
          {},
          defaultEntryStyles,
          {
            backgroundColor: "rgba(0,0,0, 0.2)",
          },
          submenuHoverStyle ? submenuHoverStyle : {}
        )}
        onMouseEnter={(e) => {
          const box = this.div.current.ref.current.getBoundingClientRect();
          const parentBox =
            this.props.parent.div.current.ref.current.getBoundingClientRect();
          const x = this.div.current.ref.current.offsetWidth;
          const y = box.top - parentBox.top;

          const submenu = new ContextMenuObject(x, y);
          React.Children.forEach(this.props.children, (child) => {
            submenu.addEntry(child);
          });
          this.setState({
            submenu: submenu,
          });

          this.setState({ hover: true });
        }}
        onMouseLeave={(e) => this.setState({ hover: false })}
      >
        {this.props.label}
        {this.state.submenu && this.state.hover && (
          <ContextMenu
            relativeElement={this.div.current.ref.current}
            parent={this.props.parent.div.current.ref.current}
            context={this.state.submenu}
            buttonStyle={this.props.buttonStyle}
            buttonHoverStyle={this.props.buttonHoverStyle}
            menuStyle={this.props.menuStyle}
            menuHoverStyle={this.props.menuHoverStyle}
            labelStyle={this.props.labelStyle}
            submenuStyle={this.props.submenuStyle}
            submenuHoverStyle={this.props.submenuHoverStyle}
          />
        )}
      </Div>
    );
  }
}

export class ContextButton extends ContextMenuEntry<{ onClick: () => void }> {
  render() {
    const { buttonStyle, buttonHoverStyle } = this.props;
    return (
      <Div
        style={Object.assign(
          {},
          defaultEntryStyles,
          {
            //button styles
          },
          buttonStyle ? buttonStyle : {}
        )}
        hoverStyle={Object.assign(
          {},
          defaultEntryStyles,
          {
            backgroundColor: "rgba(0,0,0, 0.2)",
          },
          buttonHoverStyle ? buttonHoverStyle : {}
        )}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </Div>
    );
  }
}

export class ContextSpacer extends ContextMenuEntry {
  render() {
    return (
      <div
        style={{
          width: "calc(100% - 10px)",
          marginRight: 5,
          marginLeft: 5,
          height: 0,
          marginTop: 5,
          marginBottom: 5,
          borderColor: "rgba(255,255,255,0.5)",
          borderWidth: 1,
          borderRadius: 10,
          borderStyle: "solid",
        }}
      />
    );
  }
}

interface MultilayerContextProps {
  menuStyle?: React.CSSProperties;
  menuHoverStyle?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  buttonHoverStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  submenuStyle?: React.CSSProperties;
  submenuHoverStyle?: React.CSSProperties;
}
interface MultilayerContextState {
  visible: boolean;
  context: ContextMenuObject;
}
export class MultilayerWithContext extends Layer<
  MultilayerContextProps & { id: string },
  MultilayerContextState
> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      context: null,
    };
  }

  render() {
    return (
      <MultiLayer id={this.props.id}>
        <ContextNotifierLayer id="ContextNotifierLayer" wrapper={this} />
        {this.props.children}
        {this.state.visible && (
          <ContextDrawLayer
            id="ContextDrawLayer"
            context={this.state.context}
            {...this.props}
          />
        )}
        <ContextCaptureLayer id="ContextCaptureLayer" wrapper={this} />
      </MultiLayer>
    );
  }

  closeContextMenu() {
    if (this.state.visible) {
      this.setState({
        context: null,
        visible: false,
      });
    }
  }
}
