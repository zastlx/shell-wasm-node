import { getWasm } from "../src/index";
import { canvasListeners } from "../wasm/newest/imports";
import { passStringToWasm } from "../src/utils";

let _log = console.log;
console.log = () => { }
getWasm().start();

const [ptr, len] = passStringToWasm([...Array(14)].map(() => Math.random().toString(36)[2]).join(""));
getWasm().set_mouse_params(50, 1, 0.9, false, ptr, len);


canvasListeners["pointermove"].forEach((f) => f({
    isTrusted: true,
    movementX: 1,
    movementY: 1,
}));

_log("inital", getWasm().get_yaw_pitch());

canvasListeners["pointermove"].forEach((f) => f({
    isTrusted: true,
    movementX: -1,
    movementY: -1,
}));

const old = getWasm().get_yaw_pitch();
_log("old", old);

const targetYaw = 3.14;
const targetPitch = 1;

const PI_TWO = 2 * Math.PI;
const SENSITIVITY = 0.0025;

const normalizeYaw = (yaw: number) => {
    return ((yaw % (PI_TWO)) + PI_TWO) % (PI_TWO);
};

function calculateMovements(currentYaw: number, currentPitch: number, targetYaw: number, targetPitch: number) {
    const normalizedCurrentYaw = normalizeYaw(currentYaw);
    const normalizedTargetYaw = normalizeYaw(targetYaw);

    let yawDiff = normalizedTargetYaw - normalizedCurrentYaw;
    if (Math.abs(yawDiff) > Math.PI) yawDiff = yawDiff > 0 ? yawDiff - PI_TWO : yawDiff + PI_TWO;

    const pitchDiff = targetPitch - currentPitch;

    const movementX = Math.round(-yawDiff / SENSITIVITY);
    const movementY = Math.round(-pitchDiff / SENSITIVITY);

    return { movementX, movementY };
}

const movements = calculateMovements(old.yaw, old.pitch, targetYaw, targetPitch);

canvasListeners["pointermove"].forEach((f) => f({
    isTrusted: true,
    movementX: movements.movementX,
    movementY: movements.movementY,
}));

const newOld = getWasm().get_yaw_pitch();
_log("new", newOld, movements);
