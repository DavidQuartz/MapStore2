import React from 'react';

/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, withProps } from 'recompose';
import Text from '../../contents/Text';

import withControllableState from '../../../misc/enhancers/withControllableState';


const withDefaultTabs = withProps((props) => ({
    tabs: props.tabs || [{
        id: 'popup-editor',
        titleId: 'popup-editor',
        tooltipId: 'popup-editor',
        title: 'Popup',
        visible: true,
        Component: () => {
            return (<div style={{width: '400px', height: '200px'}}><Text {...props} allowBlur={false} mode="edit" /></div>);
        }
    }]
}));

export const withLocationPopupTabs = compose(
    withControllableState('activeTab', 'setActiveTab', 'popup-editor'),
    withDefaultTabs
);

export default withLocationPopupTabs;

