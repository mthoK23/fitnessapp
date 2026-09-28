import React from "react";
import "../styles/BarChart.css";

const BarChart = ({data, dataKey = "count", labelKey= "label", barColor="#ff6b35", title}) =>{
    const maxValue = Math.max(...data.map(d=> d[dataKey]),1);

    return(
        <div className="bar-chart">
            {title && <h3 className ="chart-title">{title}</h3>}
            <div className="bar-chart-bars">
                {data.map((d,i)=>(
                    <div className="bar-chart-bar-group" key={i}>
                        <div 
                        className="bar-chart-bar"
                        style={{
                            height: `${(d[dataKey]/ maxValue)* 100}%`,
                            background: barColor,
                            opacity: d[dataKey]=== 0? 0.25:1
                        }}
                        title={`${d[labelKey]}: ${d[dataKey]}`}
                        />
                        <div className="bar-chart-label">{d[labelKey]}</div>
                    </div>

                ))}
            </div>
        </div>
    );
};

export default BarChart;