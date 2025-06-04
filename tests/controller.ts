import { gamepadTargets, getWasm } from "../src/index";
import { canvasListeners } from "../wasm/newest/imports";

let _log = console.log;
console.log = () => { }

getWasm().start();

canvasListeners.gamepadconnected.forEach(e => e({ _isGamepad: 1 }));

const moveTo = (yaw: number, pitch: number, _isSecondMoveTo = false) => {
    if (!_isSecondMoveTo) moveTo(0, 0, true);

    gamepadTargets.yaw = yaw;
    gamepadTargets.pitch = pitch;

    getWasm().poll_gamepad(0, 0.3, 20, false, 1, { _isPlayers: 1 }, {
        _isCamera: 1,
        forwardRay: {
            direction: { x: 0, y: 0, z: 0 },
            origin: { x: 0, y: 0, z: 0 }
        }
    }, 0, 0);

    if (!_isSecondMoveTo) _log('new yawpitch', getWasm().get_yaw_pitch());
}

moveTo(3, 0.75);