import React from 'react'
import Pdf from 'react-native-pdf';
import { Dimensions, View } from 'react-native';

const { width, height } = Dimensions.get('window')
export default function PDFViewScreen(props) {
    return <View>
        <Pdf
            source={props.route.params.source}
            style={{ width: width, height: height }}
        />
    </View>
}