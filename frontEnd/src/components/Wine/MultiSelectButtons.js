// src/components/MultiSelectButtons.js
export default function MultiSelectButtons({ label, options, selected, onChange }) {
    const handleClick = (value) => {
        console.log(value);
        if (selected.includes(value)) {
            onChange(selected.filter((v) => v !== value));
        } else {
            onChange([...selected, value]);
        }
    };
    return (
        <div className="form-group">
            <label>{label}</label>
            <div className="button-group">
                {options.map((opt) => (
                <button
                    type="button"
                    key={opt.value}
                    className={`choice-btn ${selected.includes(opt.value) ? "selected" : ""}`}
                    onClick={() => handleClick(opt.value)}
                >
                    {opt.label}
                </button>
                ))}
            </div>
        </div>
    );
}
