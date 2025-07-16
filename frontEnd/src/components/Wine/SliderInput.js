// src/components/SliderInput.js
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
