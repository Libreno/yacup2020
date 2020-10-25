module.exports = function (data, api) {
    let {width, height} = api.getDimensions();

    const length = width * height;
    const getColor = (r,g,b) => {
        return (r + g + b) / 3;
    }

    function getValue() {
        const res = new Uint8ClampedArray(length);
        for (let y = 1; y < height - 1; y++) {
            const lenY = 4 * (y - 1) * width;
            for (let x = 1; x < width - 1; x++) {
                let v0 = 0;
                let v255 = 255;
                for (let i = -1; i <= 1; i++) {
                    const lenX = 4 * (i + x);
                    const len1 = lenY + lenX;
                    const len2 = lenY + lenX + width * 4;
                    const len3 = lenY + lenX + width * 8;
                    const col1 = getColor(data[len1], data[len1+1], data[len1+2]);
                    const col2 = getColor(data[len2], data[len2+1], data[len2+2]);
                    const col3 = getColor(data[len3], data[len3+1], data[len3+2]);

                    v0 = Math.max(v0, col1, col2, col3);
                    v255 = Math.min(v255, col1, col2, col3);
                }
                res[y * width + x] = v0 - v255;
            }
        }
        return res;
    }

    const res = getValue();

    for (let i = 0; i < length; i++) {
        const r = 255 - res[i];
        data[4 * i] = r;
        data[4 * i + 1] = r;
        data[4 * i + 2] = r;
    }

    return Promise.resolve(data);
};
