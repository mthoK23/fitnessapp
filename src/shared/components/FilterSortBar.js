import React from "react";
import "../styles/filterBar.css";

function FilterSortBar({ 
    categories = [], 
    selectedCategory, 
    onCategoryChange, 
    sortOption =[], 
    selectedSort, 
    onSortChange}) {
    return (
        <section className ="filter-sort-bar">
            <select value ={selectedCategory} onChange={e => onCategoryChange(e.target.value)} className="filter-dropped">
                <option value="">All Categories</option>
                {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>

            <select value={selectedSort} onChange={e => onSortChange(e.target.value)} className="sort-dropped">
                {sortOption.map(opt =>(
                    <option key={opt.value} value={opt.value}>{opt.label}  </option>
                ))}
            </select>
        </section>
    );
}

export default FilterSortBar;