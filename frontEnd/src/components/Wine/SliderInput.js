import PropTypes from "prop-types";

export default function SliderInput({ label, id, min, max, value, onChange, left, right }) {
    return (
        <div className="form-group">
            <label htmlFor={id}>{label}</label>
            <div className="slider-container">
                <div className="slider-labels">
                    <span>{left}</span>
                    <span>{right}</span>
                </div>
                <input
                    type="range"
                    id={id}
                    min={min}
                    max={max}
                    value={value}
                    onChange={e => onChange(Number(e.target.value))}
                    className="slider"
                />
                <div className="slider-value">
                    <span>{value}</span>/{max}
                </div>
            </div>
        </div>
    );
}

// PropTypes 추가!
SliderInput.propTypes = {
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    left: PropTypes.string,      // 양쪽 라벨은 선택(옵션)
    right: PropTypes.string,
};