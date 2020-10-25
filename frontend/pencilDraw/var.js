module.exports = function (data, api) {
    let {width, height} = api.getDimensions();

    const length = width * height;
    const getColor = ([r,g,b]) => {
        return (r + g + b) / 3;
    }

    function getValueFactory(mathFunction) {
        return initialValue => {
            const res = new Uint8ClampedArray(length);
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    let value = initialValue;
                    for (let i = -1; i <= 1; i++) {
                        let prevLine = data.slice(4 * (y - 1) * width, (y * width) * 4),
                            curLine = data.slice(4 * y * width, ((y + 1) * width) * 4),
                            nextLine = data.slice(4 * (y + 1) * width, ((y + 2) * width) * 4);

                        value = mathFunction(
                            value,
                            getColor(prevLine.slice(4 * (i + x), 4 * (i + x) + 3)),
                            getColor(curLine.slice(4 * (i + x), 4 * (i + x) + 3)),
                            getColor(nextLine.slice(4 * (i + x), 4 * (i + x) + 3))
                        );
                    }
                    res[y * width + x] = value;
                }
            }
            return res;
        };
    }

    const getMinimums = getValueFactory(Math.min),
        getMaximums = getValueFactory(Math.max);

    const res = new Uint8ClampedArray(length);

    for (let i = 0; i < length; i++) {
        res[i] = getMaximums(0)[i] - getMinimums(255)[i];
    }

    for (let i = 0; i < length; i++) {
        data[4 * i] = 255 - res[i];
        data[4 * i + 1] = 255 - res[i];
        data[4 * i + 2] = 255 - res[i];
    }

    return Promise.resolve(data);
};
