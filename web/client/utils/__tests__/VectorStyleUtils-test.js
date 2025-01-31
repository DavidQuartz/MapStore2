/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import axios from 'axios';
import { isObject } from 'lodash';

import {
    isAttrPresent,
    isStrokeStyle,
    isFillStyle,
    isTextStyle,
    isCircleStyle,
    isMarkerStyle,
    isSymbolStyle,
    getStylerTitle,
    geometryFunctions,
    getGeometryFunction,
    registerGeometryFunctions,
    addOpacityToColor,
    hashCode,
    registerStyle,
    fetchStyle,
    hashAndStringify,
    createSvgUrl,
    createStylesAsync,
    setSymbolsStyles,
    getSymbolsStyles,
    getStyleParser,
    getImageIdFromSymbolizer,
    flattenFeatures,
    drawIcons,
    geoStylerStyleFilter,
    layerToGeoStylerStyle,
    applyDefaultStyleToLayer
} from '../VectorStyleUtils';

const LENGTH_OF_OBJECT_DATA_URL = "blob:http://localhost:9876/87844744-f879-4f5b-90bc-2cc6e70ba3cd".length;

describe("VectorStyleUtils ", () => {

    afterEach((done) => {

        setSymbolsStyles({});
        setTimeout(done);
    });
    it("isAttrPresent", () => {
        const attributes = ["attribute1", "attribute2"];
        const style = {
            attribute1: "value1",
            attribute2: "value2"
        };
        expect(isAttrPresent(style, attributes)).toBe(true);
    });
    it("isStrokeStyle", () => {
        expect(isStrokeStyle({})).toBe(false);
        let styleStroke = { color: "#FF00FF" };
        expect(isStrokeStyle(styleStroke)).toBe(true);
        styleStroke = { opacity: 1 };
        expect(isStrokeStyle(styleStroke)).toBe(true);
        styleStroke = { dashArray: [1] };
        expect(isStrokeStyle(styleStroke)).toBe(true);
        styleStroke = { dashOffset: 1 };
        expect(isStrokeStyle(styleStroke)).toBe(true);
        styleStroke = { lineCap: "round"};
        expect(isStrokeStyle(styleStroke)).toBe(true);
        styleStroke = { lineJoin: "round" };
        expect(isStrokeStyle(styleStroke)).toBe(true);
        styleStroke = { weight: 2 };
        expect(isStrokeStyle(styleStroke)).toBe(true);
        expect(isFillStyle(styleStroke)).toBe(false);
        expect(isCircleStyle(styleStroke)).toBe(false);
        expect(isTextStyle(styleStroke)).toBe(false);
        expect(isMarkerStyle(styleStroke)).toBe(false);
        expect(isSymbolStyle(styleStroke)).toBe(false);

        const styleStrokeFill = {
            fillColor: "#FF00FF",
            color: "#FF00FF"
        };
        expect(isStrokeStyle(styleStrokeFill)).toBe(true);
    });
    it("isFillStyle", () => {
        expect(isFillStyle({})).toBe(false);
        let styleFill = {
            fillColor: "#FF00FF"
        };
        expect(isFillStyle(styleFill)).toBe(true);
        styleFill = {
            fillOpacity: "#FF00FF"
        };
        expect(isFillStyle(styleFill)).toBe(true);
        expect(isStrokeStyle(styleFill)).toBe(false);
        expect(isCircleStyle(styleFill)).toBe(false);
        expect(isTextStyle(styleFill)).toBe(false);
        expect(isMarkerStyle(styleFill)).toBe(false);
        expect(isSymbolStyle(styleFill)).toBe(false);
        const styleStrokeFill = {
            fillColor: "#FF00FF",
            color: "#FF00FF"
        };
        expect(isFillStyle(styleStrokeFill)).toBe(true);
    });
    it("isTextStyle", () => {
        expect(isTextStyle({})).toBe(false);
        const styleText = {
            label: "this is a text",
            fontStyle: "normal",
            fontSize: "14",
            fontSizeUom: "px",
            fontFamily: "Arial",
            fontWeight: "normal",
            font: "14px Arial",
            textAlign: "center",
            color: "#000000",
            opacity: 1,
            fillColor: "#000000",
            fillOpacity: 1
        };
        expect(isStrokeStyle(styleText)).toBe(true);
        expect(isFillStyle(styleText)).toBe(true);
        expect(isTextStyle(styleText)).toBe(true);
        expect(isCircleStyle(styleText)).toBe(false);
        expect(isMarkerStyle(styleText)).toBe(false);
        expect(isSymbolStyle(styleText)).toBe(false);
        const styleStrokeFillText = {
            label: "this is a text",
            fillColor: "#FF00FF",
            color: "#FF00FF"
        };
        expect(isTextStyle(styleStrokeFillText)).toBe(true);
    });
    it("isCircleStyle", () => {
        expect(isCircleStyle({})).toBe(false);
        const styleCircle = {
            radius: 10
        };
        expect(isStrokeStyle(styleCircle)).toBe(false);
        expect(isFillStyle(styleCircle)).toBe(false);
        expect(isTextStyle(styleCircle)).toBe(false);
        expect(isCircleStyle(styleCircle)).toBe(true);
        expect(isMarkerStyle(styleCircle)).toBe(false);
        expect(isSymbolStyle(styleCircle)).toBe(false);
    });
    it("isMarkerStyle", () => {
        expect(isMarkerStyle({})).toBe(false);
        const styleMarker = {
            iconGlyph: "comment",
            iconShape: "square",
            iconColor: "blue"
        };
        expect(isStrokeStyle(styleMarker)).toBe(false);
        expect(isFillStyle(styleMarker)).toBe(false);
        expect(isTextStyle(styleMarker)).toBe(false);
        expect(isCircleStyle(styleMarker)).toBe(false);
        expect(isMarkerStyle(styleMarker)).toBe(true);
        expect(isSymbolStyle(styleMarker)).toBe(false);
    });
    it("isSymbolStyle", () => {
        expect(isSymbolStyle({})).toBe(false);
        const styleSymbol = {
            symbolUrl: "comment"
        };
        expect(isStrokeStyle(styleSymbol)).toBe(false);
        expect(isFillStyle(styleSymbol)).toBe(false);
        expect(isTextStyle(styleSymbol)).toBe(false);
        expect(isCircleStyle(styleSymbol)).toBe(false);
        expect(isMarkerStyle(styleSymbol)).toBe(false);
        expect(isSymbolStyle(styleSymbol)).toBe(true);
    });

    it("getStylerTitle basic styles, not mixed up", () => {
        expect(getStylerTitle({})).toBe("");
        const styleStroke = {
            color: "#FF00FF"
        };
        expect(getStylerTitle(styleStroke)).toBe("Polyline");
        const styleFill = {
            fillColor: "#FF00FF"
        };
        expect(getStylerTitle(styleFill)).toBe("Polygon");
        const styleText = {
            label: "this is a text"
        };
        expect(getStylerTitle(styleText)).toBe("Text");
        const styleCircle = {
            radius: 10
        };
        expect(getStylerTitle(styleCircle)).toBe("Circle");
        expect(getStylerTitle({title: "Circle Style"})).toBe("Circle");
        const styleMarker = {
            iconGlyph: "comment",
            iconShape: "square",
            iconColor: "blue"
        };
        expect(getStylerTitle(styleMarker)).toBe("Marker");
        const styleSymbol = {
            symbolUrl: "comment"
        };
        expect(getStylerTitle(styleSymbol)).toBe("Symbol");
    });

    it("getStylerTitle mixed up styles", () => {
        expect(getStylerTitle({})).toBe("");
        const styleMixed = {
            color: "#FF00FF",
            fillColor: "#FF00FF",
            label: "this is a text",
            radius: 10,
            iconGlyph: "comment",
            symbolUrl: "comment"
        };
        expect(getStylerTitle(styleMixed)).toBe("Marker");
        const styleMixedNoMarker = {
            color: "#FF00FF",
            fillColor: "#FF00FF",
            label: "this is a text",
            radius: 10,
            symbolUrl: "comment"
        };
        expect(getStylerTitle(styleMixedNoMarker)).toBe("Symbol");
        const styleMixedNoSymbol = {
            color: "#FF00FF",
            fillColor: "#FF00FF",
            label: "this is a text",
            radius: 10
        };
        expect(getStylerTitle(styleMixedNoSymbol)).toBe("Text");
        const styleMixedNoText = {
            color: "#FF00FF",
            fillColor: "#FF00FF",
            radius: 10
        };
        expect(getStylerTitle(styleMixedNoText)).toBe("Circle");
        const styleMixedNoCircle = {
            color: "#FF00FF",
            fillColor: "#FF00FF"
        };
        expect(getStylerTitle(styleMixedNoCircle)).toBe("Polygon");
        const styleStroke = {
            color: "#FF00FF"
        };
        expect(getStylerTitle(styleStroke)).toBe("Polyline");
    });
    it("geometryFunctions base object", () => {
        expect(isObject(geometryFunctions)).toBe(true);
        expect(!!geometryFunctions.centerPoint).toBe(true);
        expect(geometryFunctions.centerPoint.type).toBe("Point");
        expect(!!geometryFunctions.startPoint).toBe(true);
        expect(geometryFunctions.startPoint.type).toBe("Point");
        expect(!!geometryFunctions.endPoint).toBe(true);
        expect(geometryFunctions.lineToArc.type).toBe("LineString");
        expect(!!geometryFunctions.lineToArc).toBe(true);
        expect(geometryFunctions.endPoint.type).toBe("Point");
        expect(Object.keys(geometryFunctions).length).toBe(4);
    });
    it("getGeometryFunction", () => {
        expect(getGeometryFunction("centerPoint", "type")).toBe("Point");
        expect(getGeometryFunction("startPoint", "type")).toBe("Point");
        expect(getGeometryFunction("endPoint", "type")).toBe("Point");
    });
    it("registerGeometryFunctions", () => {
        expect(getGeometryFunction("firstLine", "type")).toBe(undefined);
        registerGeometryFunctions("firstLine", () => {}, "LineString");
        expect(getGeometryFunction("firstLine", "type")).toBe("LineString");
        try {
            registerGeometryFunctions("firstLine", () => {});
        } catch (e) {
            expect(e.message).toBe("specify all the params: functionName, func, type");
        }
    });
    it("addOpacityToColor", () => {
        expect(addOpacityToColor({r: 255, g: 255, b: 255}, 0).a).toBe(0);
        expect(addOpacityToColor({r: 255, g: 255, b: 255}).a).toBe(0.2);
    });
    it("hashCode", () => {
        expect(hashCode("str")).toBe(114225);
    });
    it("SymbolsStyles", () => {
        expect(Object.keys(getSymbolsStyles()).length).toBe(0);
    });
    it("registerStyle one symbol style", () => {
        expect(Object.keys(getSymbolsStyles()).length).toBe(0);
        const style = {
            symbolUrl: "/path/symbol.svg",
            color: "#005544",
            fillColor: "#218f8f"
        };
        registerStyle(hashAndStringify(style), {style});
        expect(Object.keys(getSymbolsStyles()).length).toBe(1);

        try {
            registerStyle();
        } catch (e) {
            expect(e.message).toBe("specify all the params: sha, style");
        }
    });
    it("fetchStyle", () => {
        const style = {
            symbolUrl: "/path/symbol.svg",
            color: "#005544",
            fillColor: "#218f8f"
        };
        registerStyle(hashAndStringify(style), {style});
        expect(fetchStyle(hashAndStringify(style)).color).toBe("#005544");
    });
    it("hashAndStringify", () => {
        const style = {
            symbolUrl: "/path/symbol.svg",
            color: "#005544",
            fillColor: "#218f8f"
        };
        expect(hashAndStringify(style)).toBe(-1572904514);
        try {
            hashAndStringify();
        } catch (e) {
            expect(e.message).toBe("hashAndStringify: specify mandatory params: style");
        }
    });

    it("createSvgUrl with defaults", () => {
        createSvgUrl().then((res) => {
            expect(res).toBe(null);
        });
    });

    it("createSvgUrl with defaults", () => {
        createSvgUrl().then((res) => {
            expect(res).toBe(null);
        });
    });

    it("createSvgUrl with a non symbol style", () => {
        const style = {
            color: "#005544",
            fillColor: "#218f8f"
        };
        createSvgUrl(style).then((res) => {
            expect(res).toBe(null);
        });
    });

    it("createSvgUrl with a new symbol style, no url", () => {
        const style = {
            symbolUrl: "base/web/client/test-resources/symbols/stop-hexagonal-signal.svg",
            color: "#FF0000",
            fillColor: "#FF0000"
        };
        createSvgUrl(style).then((res) => {
            expect(res).toBe(null);
        }).catch(e => {
            expect(e.message).toBe("Cannot read property \'protocol\' of undefined");
        });
    });
    it("createSvgUrl with a new symbol style, with url specified", () => {
        const symbolUrl = "base/web/client/test-resources/symbols/stop-hexagonal-signal.svg";
        const style = {
            symbolUrl,
            color: "#FF0000",
            fillColor: "#FF0000"
        };
        createSvgUrl(style, symbolUrl).then((res) => {
            expect(res.length).toBe(LENGTH_OF_OBJECT_DATA_URL);
        }).catch(e => {
            expect(e.message).toBe("Cannot read property \'protocol\' of undefined");
        });
    });
    it("createStylesAsync with defaults", () => {
        expect(createStylesAsync().length).toBe(0);
    });
    it("createStylesAsync with two non symbols styles", () => {
        const style = {
            color: "#FF0000",
            fillColor: "#FF0000"
        };
        const style2 = {
            color: "#FF00FF",
            fillColor: "#FF00FF"
        };
        const styles = createStylesAsync([style, style2]);
        axios.all(styles).then(results => {
            expect(results[0].color).toBe("#FF0000");
            expect(results[0].fillColor).toBe("#FF0000");
            expect(results[0].symbolUrlCustomized).toBe(undefined);
            expect(results[1].color).toBe("#FF00FF");
            expect(results[1].fillColor).toBe("#FF00FF");
        });
    });
    it("createStylesAsync with a non symbols style and a symbol style", () => {
        const symbolUrl = "base/web/client/test-resources/symbols/stop-hexagonal-signal.svg";

        const style = {
            symbolUrl,
            color: "#FF0000",
            fillColor: "#FF0000"
        };
        const style2 = {
            color: "#FF00FF",
            fillColor: "#FF00FF"
        };
        const styles = createStylesAsync([style, style2]);
        expect(style.symbolUrlCustomized).toBe(undefined);
        axios.all(styles).then(results => {
            expect(results[0].color).toBe("#FF0000");
            expect(results[0].symbolUrl).toBe(symbolUrl);
            expect(results[0].symbolUrlCustomized.length).toBe(LENGTH_OF_OBJECT_DATA_URL);
            expect(results[0].fillColor).toBe("#FF0000");
            expect(results[1].color).toBe("#FF00FF");
            expect(results[1].fillColor).toBe("#FF00FF");
        });
    });
    it('getStyleParser returns parsers for sld format', (done) => {
        getStyleParser('sld')
            .then((parser) => {
                expect(parser).toBeTruthy();
                expect(parser.readStyle).toBeTruthy();
                expect(parser.writeStyle).toBeTruthy();
                done();
            });
    });

    it('getStyleParser returns parsers for css format', (done) => {
        getStyleParser('css')
            .then((parser) => {
                expect(parser).toBeTruthy();
                expect(parser.readStyle).toBeTruthy();
                expect(parser.writeStyle).toBeTruthy();
                done();
            });
    });

    it('should not return a parser with unsupported format', (done) => {
        getStyleParser('unknown')
            .then((parser) => {
                expect(parser).toBeFalsy();
                done();
            });
    });


    it('should create an image id based on Icon or Mark symbolizers', () => {

        expect(getImageIdFromSymbolizer({
            kind: 'Mark',
            wellKnownName: 'Circle',
            color: '#ff0000',
            fillOpacity: 0.5,
            strokeColor: '#00ff00',
            strokeOpacity: 0.25,
            strokeWidth: 3,
            radius: 16,
            rotate: 90
        })).toBe('Circle:#ff0000:0.5:#00ff00:0.25:3:16');

        expect(getImageIdFromSymbolizer({
            kind: 'Icon',
            image: 'path/to/image',
            opacity: 0.5,
            size: 32,
            rotate: 90
        })).toBe('path/to/image');

    });

    it('should flatten features collection array in a single list of features', () => {
        const features = [
            {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: { name: 'A' },
                        geometry: {
                            type: 'Point',
                            coordinates: [7, 41]
                        }
                    }
                ]
            },
            {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: { name: 'B' },
                        geometry: {
                            type: 'Point',
                            coordinates: [6, 40]
                        }
                    }
                ]
            }
        ];
        expect(flattenFeatures(features)).toEqual([
            {
                type: 'Feature',
                properties: { name: 'A' },
                geometry: {
                    type: 'Point',
                    coordinates: [7, 41]
                }
            },
            {
                type: 'Feature',
                properties: { name: 'B' },
                geometry: {
                    type: 'Point',
                    coordinates: [6, 40]
                }
            }
        ]);
    });

    it('should preload images and marker from a style', (done) => {
        const geoStylerStyle = {
            name: '',
            rules: [
                {
                    filter: undefined,
                    name: '',
                    symbolizers: [
                        {
                            kind: 'Mark',
                            wellKnownName: 'Circle',
                            color: '#ff0000',
                            fillOpacity: 0.5,
                            strokeColor: '#00ff00',
                            strokeOpacity: 0.25,
                            strokeWidth: 3,
                            radius: 16,
                            rotate: 90
                        }
                    ]
                },
                {
                    filter: undefined,
                    name: '',
                    symbolizers: [
                        {
                            kind: 'Icon',
                            image: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
                            opacity: 0.5,
                            size: 32,
                            rotate: 90
                        }
                    ]
                }
            ]
        };
        drawIcons(geoStylerStyle)
            .then((images) => {
                try {
                    expect(images[0].id).toEqual('Circle:#ff0000:0.5:#00ff00:0.25:3:16');
                    expect(images[1].id).toEqual('data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');
                } catch (e) {
                    done(e);
                }
                done();
            });
    });

    it('should read filter expression applied to a feature properties using geoStylerStyleFilter', () => {
        const feature = { properties: { count: 10, name: 'Abc' } };
        expect(geoStylerStyleFilter(feature, ['==', 'count', 10])).toBe(true);
        expect(geoStylerStyleFilter(feature, ['!=', 'count', 10])).toBe(false);
        expect(geoStylerStyleFilter(feature, ['>=', 'count', 10])).toBe(true);
        expect(geoStylerStyleFilter(feature, ['<=', 'count', 10])).toBe(true);
        expect(geoStylerStyleFilter(feature, ['<', 'count', 10])).toBe(false);
        expect(geoStylerStyleFilter(feature, ['>', 'count', 10])).toBe(false);
        expect(geoStylerStyleFilter(feature, ['*=', 'name', 'A'])).toBe(true);
        expect(geoStylerStyleFilter(feature, ['*=', 'name', 'd'])).toBe(false);

        expect(geoStylerStyleFilter(feature, ['||', ['*=', 'name', 'd'], ['<', 'count', 10]])).toBe(false);
        expect(geoStylerStyleFilter(feature, ['||', ['*=', 'name', 'd'], ['<=', 'count', 10]])).toBe(true);

        expect(geoStylerStyleFilter(feature, ['&&', ['*=', 'name', 'd'], ['<=', 'count', 10]])).toBe(false);
        expect(geoStylerStyleFilter(feature, ['&&', ['*=', 'name', 'A'], ['<=', 'count', 10]])).toBe(true);
    });

    it('should parse mapstore annotation style to geostyler style with layerToGeoStylerStyle', (done) => {

        const layer = {
            type: 'vector',
            features: [
                {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            properties: {
                                id: 'annotation-id'
                            },
                            geometry: {
                                type: 'Polygon',
                                coordinates: [[[7, 41], [14, 41], [14, 46], [7, 46], [7, 41]]]
                            },
                            style: {
                                fillColor: '#ff0000',
                                fillOpacity: 0.5,
                                color: '#00ff00',
                                opacity: 0.25,
                                weight: 2
                            }
                        }
                    ]
                }
            ]
        };

        layerToGeoStylerStyle(layer)
            .then((style) => {
                try {
                    expect(style).toEqual({
                        format: 'geostyler',
                        body: {
                            name: '',
                            rules: [
                                {
                                    name: '',
                                    filter: [ '==', 'id', 'annotation-id' ],
                                    symbolizers: [
                                        {
                                            kind: 'Fill',
                                            color: '#ff0000',
                                            opacity: 0.5,
                                            fillOpacity: 0.5,
                                            outlineColor: '#00ff00',
                                            outlineOpacity: 0.25,
                                            outlineWidth: 2
                                        }
                                    ]
                                }
                            ]
                        },
                        metadata: {
                            editorType: 'visual'
                        }
                    });
                } catch (e) {
                    done(e);
                }
                done();
            });
    });

    it('should parse mapstore simple style to geostyler style with layerToGeoStylerStyle', (done) => {
        const layer = {
            type: 'vector',
            features: [],
            style: {
                fillColor: '#ff0000',
                fillOpacity: 0.5,
                color: '#00ff00',
                opacity: 0.25,
                weight: 2
            }
        };

        layerToGeoStylerStyle(layer)
            .then((style) => {
                try {

                    expect(style).toEqual({
                        format: 'geostyler',
                        body: {
                            name: '',
                            rules: [
                                {
                                    name: '',
                                    symbolizers: [
                                        {
                                            kind: 'Line',
                                            color: '#00ff00',
                                            opacity: 0.25,
                                            width: 2
                                        }
                                    ]
                                },
                                {
                                    name: '',
                                    symbolizers: [
                                        {
                                            kind: 'Fill',
                                            color: '#ff0000',
                                            opacity: 0.5,
                                            fillOpacity: 0.5,
                                            outlineColor: '#00ff00',
                                            outlineOpacity: 0.25,
                                            outlineWidth: 2
                                        }
                                    ]
                                }
                            ]
                        },
                        metadata: {
                            editorType: 'visual'
                        }
                    });
                } catch (e) {
                    done(e);
                }
                done();
            });
    });

    it('should not parse style if geostyler style already', (done) => {
        const layer = {
            type: 'vector',
            features: [],
            style: {
                format: 'geostyler',
                body: {
                    name: '',
                    rules: []
                }
            }
        };

        layerToGeoStylerStyle(layer)
            .then((style) => {
                try {
                    expect(style).toEqual(layer.style);
                } catch (e) {
                    done(e);
                }
                done();
            });
    });

    it('should add default style if the layer id providing an empty style object with applyDefaultStyleToLayer', () => {
        const layer = {};
        const newLayerWithStyle = applyDefaultStyleToLayer(layer);
        expect(newLayerWithStyle.style).toEqual({
            format: 'geostyler',
            body: {
                name: 'Default Style',
                rules: [
                    {
                        name: 'Default Point Style',
                        symbolizers: [
                            {
                                kind: 'Mark',
                                color: '#f2f2f2',
                                fillOpacity: 0.3,
                                opacity: 0.5,
                                strokeColor: '#3075e9',
                                strokeOpacity: 1,
                                strokeWidth: 2,
                                wellKnownName: 'Circle',
                                radius: 10,
                                msBringToFront: true
                            }
                        ]
                    },
                    {
                        name: 'Default Line Style',
                        symbolizers: [
                            {
                                kind: 'Line',
                                color: '#3075e9',
                                opacity: 1,
                                width: 2
                            }
                        ]
                    },
                    {
                        name: 'Default Polygon Style',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#f2f2f2',
                                fillOpacity: 0.3,
                                outlineColor: '#3075e9',
                                outlineOpacity: 1,
                                outlineWidth: 2
                            }
                        ]
                    }
                ]
            }
        });
    });

});
