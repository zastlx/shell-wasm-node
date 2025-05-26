import { getWasm } from "./src/index";
import { canvasListeners } from "./wasm/newest/imports";
import { passStringToWasm } from './src/utils';

getWasm().start();

const [ptr, len] = passStringToWasm([...Array(14)].map(() => Math.random().toString(36)[2]).join(''));
getWasm().set_mouse_params(50, 1, 0.9, false, ptr, len);

let _log = console.log;
console.log = () => { };

canvasListeners['pointermove']({
    isTrusted: true,
    movementX: 1,
    movementY: 1,
});

_log(getWasm().get_yaw_pitch());

canvasListeners['pointermove']({
    isTrusted: true,
    movementX: -1,
    movementY: -1,
});

const old = getWasm().get_yaw_pitch();
_log('old', old);

const targetYaw = 3.14;
const targetPitch = 1;

function calculateMovements(currentYaw: number, currentPitch: number, targetYaw: number, targetPitch: number) {
    const normalizeYaw = (yaw: number) => {
        while (yaw < 0) yaw += 2 * Math.PI;
        while (yaw >= 2 * Math.PI) yaw -= 2 * Math.PI;
        return yaw;
    };

    const normalizedCurrentYaw = normalizeYaw(currentYaw);
    const normalizedTargetYaw = normalizeYaw(targetYaw);

    let yawDiff = normalizedTargetYaw - normalizedCurrentYaw;
    if (Math.abs(yawDiff) > Math.PI) {
        yawDiff = yawDiff > 0 ? yawDiff - 2 * Math.PI : yawDiff + 2 * Math.PI;
    }

    const pitchDiff = targetPitch - currentPitch;

    const yawSensitivity = 0.0025;
    const pitchSensitivity = 0.0025;

    const movementX = Math.round(-yawDiff / yawSensitivity);
    const movementY = Math.round(-pitchDiff / pitchSensitivity);

    return { movementX, movementY };
}

_log('balls');

const movements = calculateMovements(old.yaw, old.pitch, targetYaw, targetPitch);

canvasListeners['pointermove']({
    isTrusted: true,
    movementX: movements.movementX,
    movementY: movements.movementY,
});

const newOld = getWasm().get_yaw_pitch();
_log(newOld, movements);

const newTargetYaw = 3;
const newTargetPitch = 0.2;

const newMovements = calculateMovements(newOld.yaw, newOld.pitch, newTargetYaw, newTargetPitch);

canvasListeners['pointermove']({
    isTrusted: true,
    movementX: newMovements.movementX,
    movementY: newMovements.movementY,
});

_log(getWasm().get_yaw_pitch(), newMovements);