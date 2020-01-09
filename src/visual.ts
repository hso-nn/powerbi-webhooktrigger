/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";

import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import * as d3 from 'd3'
import * as $ from "jquery"

import { VisualSettings } from "./settings";
export class Visual implements IVisual {
    private target: HTMLElement;
    private settings: VisualSettings;
    private data: any;

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.target = options.element;

        const target = d3.select(this.target);
        target.append("button")
            .attr("id", "submitButton")
            .classed("btn", true)
            .text("Submit")
            .on("mousedown", () => this.submit())
    }

    public update(options: VisualUpdateOptions) {
        this.data = options.dataViews[0].table
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

        d3.select("#submitButton")
            .style("height", `${options.viewport.height}px`)
            .style("width", `${options.viewport.width}px`)
            .style("font-size", `${this.settings.general.fontSize}px`)
            .style("background-color", `${this.settings.general.fill}`)
            .style("border", `${this.settings.general.borderWidth}px solid ${this.settings.general.borderColor}`)
            .style("color", `${this.settings.general.fontColor}`)
            .text(this.settings.general.buttonText)
    }

    private submit() {
        const url = this.settings.web.url;
        const names = this.data.columns.map((c: any) => c.displayName)
        const rows = this.data.rows.map((row: any) => (
            Object.assign({}, ...names.map((k: string, i: number) => ({[k]: row[i]} )))
        ))
        
        $.ajax({
            url: url,
            type: "POST",
            contentType: 'application/json',
            data: JSON.stringify(rows),
            success: () => {
                console.log("Success")
            },
            error: (jqXhr, status, error) => {
                console.log(error)
            }
        })
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return VisualSettings.parse(dataView) as VisualSettings;
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}
