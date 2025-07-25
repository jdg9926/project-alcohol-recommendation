import PropTypes from "prop-types";

export default function MultiSelectButtons({ label, options, selected, onChange }) {
    const handleClick = (value) => {
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

MultiSelectButtons.propTypes = {
    label: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    selected: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
};
