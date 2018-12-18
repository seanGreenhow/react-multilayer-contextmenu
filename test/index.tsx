import * as React from "react"
import * as ReactDOM from "react-dom"
import { Layer, Multilayer } from "react-multilayer";
import { MultilayerWithContext, ContextLabel, ContextSpacer, ContextButton, ContextSubmenu, Context } from "..";

window.onload = async () => {
    ReactDOM.render((
        <div style={{ height: '100%' }}>
            <MultilayerWithContext id="MultilayerWithContext">
                <Layer id="Layer 1" style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(255,0,0,0.5)"
                }} onContextMenu={(e) => {
                    Context.addEntry(<ContextButton onClick={() => console.log('Layer 1 Button click')}>Layer 1 Button</ContextButton>)
                }}>
                    <button style={{ position: 'relative', background: 'rgb(255,255,255)', top: '33%' }}
                        onClick={(e) => console.log('Button on Layer 1')}
                    >Layer 1</button>
                </Layer>
                <Multilayer id="MultilayerWithoutContext">
                    <Layer id="Layer 2"
                        style={{
                            width: "50%",
                            backgroundColor: "rgba(255,0,0,0.5)"
                        }}
                        onContextMenu={(e) => {
                            Context.addEntry(
                                <ContextSubmenu label="Layer 2 Submenu">
                                    <ContextLabel>Layer 2 Submenu Label</ContextLabel>
                                    <ContextSpacer />
                                    <ContextButton onClick={() => console.log('Layer 2 Submenu Button Click')}>Layer 2 Submenu Button</ContextButton>
                                </ContextSubmenu>
                            )
                        }}
                    >
                        <button style={{ position: 'relative', background: 'rgb(255,255,255)', top: '66%' }} onClick={(e) => console.log('Button on Layer 2')}
                        >Layer 2</button>
                    </Layer>
                    <Layer id="Layer 3"
                        style={{
                            width: "50%",
                            height: "50%",
                            backgroundColor: "rgba(255,0,0,0.5)"
                        }}
                        onContextMenu={(e) => {
                            Context.addEntry(
                                <ContextSubmenu label="Layer 3 Submenu">
                                    <ContextLabel>Layer 3 Submenu Label</ContextLabel>
                                    <ContextSpacer />
                                    <ContextSubmenu label="Layer 3 Submenu Submenu">
                                        <ContextLabel>Layer 3 Submenu Submenu Label</ContextLabel>
                                        <ContextSpacer />
                                        <ContextButton onClick={() => console.log('Layer 3 Submenu Submenu Button Click')}>Layer 3 Submenu Submenu Button</ContextButton>
                                    </ContextSubmenu>
                                </ContextSubmenu>
                            )
                        }}
                    >
                        <button style={{ position: 'relative', background: 'rgb(255,255,255)', top: '33%' }} onClick={(e) => console.log('Button on Layer 3')}>Layer 3</button>
                    </Layer>
                </Multilayer>
            </MultilayerWithContext>
        </div>
    ), document.getElementById("root"))
}