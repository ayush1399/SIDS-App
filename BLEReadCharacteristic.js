import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  Button,
  Dimensions,
} from 'react-native';
import base64 from 'react-native-base64';
import {writeCharacteristic, addIR, addRD} from './actions';
import DataActivityIndicator from './DataActivityIndicator';
import {LineChart} from 'react-native-chart-kit';

function Item({RS, characteristic}) {
  // characteristic = await characteristic.read();
  const [measure, setMeasure] = useState(0.0);
  const [descriptor, setDescriptor] = useState('');

  useEffect(() => {
    // discover characteristic descriptors
    characteristic.descriptors().then(desc => {
      desc[0]?.read().then(val => {
        if (val) {
          setDescriptor(val.value);
        }
      });
    });

    // read on the characteristic 👏
    characteristic.monitor((err, cha) => {
      if (err) {
        console.warn('ERROR');
        return;
      }
      // each received value has to be decoded with a Base64 algorithm you can find on the Internet (or in my repository 😉)
      // setMeasure(measure.push(cha));
      const m = base64.decode(cha?.value.toString());
      if (m[0] === 'T') {
        let t = m.split('-')[1];
        // t = Number(t);
        setMeasure(t);
      } else {
        let t = m.split('-');
        const datum = {
          seq: Number(t[0]),
          val: Number(t[2]),
        };
        if (m[3] === 'R' && m[4] === 'D') {
          RS.writeRD(datum);
        } else if (m[3] === 'I' && m[4] === 'R') {
          RS.writeIR(datum);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characteristic]);

  return (
    <View style={styles.item}>
      <Text style={styles.title}>
        On Board Chip Temperature: {measure}° Celsius
      </Text>
    </View>
  );
}

function handleClick(ReduxStore, text) {
  ReduxStore.writeCharacteristic(text + '\n');
}

function BLEReadcharacteristic(ReduxStore) {
  const [text, setText] = useState({text: ''});
  const [flag1, setflag1] = useState(false);
  const [flag2, setflag2] = useState(false);
  const [flag3, setflag3] = useState(false);

  const [IR_RunningMean, updateRunningMean] = useState(() => {
    let sum = ReduxStore.IR.reduce((acc, val) => acc + val, 0);
    // console.log(sum / ReduxStore.IR.length);
    return sum / ReduxStore.IR.length;
  });
  console.log(IR_RunningMean);
  const [percentageDiff, setPDF] = useState(0);

  useEffect(() => {
    let newPDF = ReduxStore.IR.slice(-1)[0] / IR_RunningMean;
    setPDF(newPDF);
    updateRunningMean(
      ReduxStore.IR.reduce((acc, val) => acc + val, 0) / ReduxStore.IR.length,
    );
    console.log(newPDF);
    if (newPDF < 0.98) {
      if (flag1 && flag2) {
        setflag3(true);
      } else if (flag1) {
        setflag2(true);
      } else if (!flag1) {
        setflag1(true);
      } else {
        setflag1(false);
        setflag2(false);
        setflag3(false);
      }
    } else if (newPDF < 0.99) {
      if (flag1 && flag2) {
        setflag3(true);
      } else if (flag1) {
        setflag2(true);
      } else {
        setflag1(false);
        setflag2(false);
        setflag3(false);
      }
    } else if (newPDF < 0.999) {
      if (flag1 && flag2) {
        setflag3(true);
      } else {
        setflag1(false);
        setflag2(false);
        setflag3(false);
      }
    } else {
      setflag1(false);
      setflag2(false);
      setflag3(false);
    }
    console.log(flag1, flag2, flag3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ReduxStore.IR]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[ReduxStore.selectedCharacteristic]}
        renderItem={({item}) => (
          <>
            <Item RS={ReduxStore} characteristic={item} />
          </>
        )}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={DataActivityIndicator}
      />
      <Text
        style={{
          fontWeight: 'bold',
          color: flag1 & flag2 & flag3 ? 'red' : 'black',
          fontSize: 32,
          marginLeft: 18,
        }}>
        {flag1 & flag2 & flag3 ? 'NOT BREATHING!' : 'BREATH IS NORMAL'}
      </Text>
      <Text
        style={{
          fontWeight: 'bold',
          color: 'black',
          fontSize: 24,
          marginLeft: 18,
        }}>
        {percentageDiff < 1.05 && percentageDiff > 0.95
          ? 'Sensor calibrated'
          : 'Please allow time for the sensor to calibrate itself'}
      </Text>
      <Text
        style={{
          fontWeight: 'bold',
          color: 'gray',
          fontSize: 21,
          marginLeft: 18,
        }}>
        RAW Red LED Data Received
      </Text>
      <LineChart
        data={{
          datasets: [
            {
              data: ReduxStore.RD.slice(-25, -1),
            },
          ],
        }}
        width={Dimensions.get('window').width - 25} // from react-native
        height={220}
        // yAxisLabel={}
        chartConfig={{
          backgroundColor: '#1cc910',
          backgroundGradientFrom: '#eff3ff',
          backgroundGradientTo: '#efefef',
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 255) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
      <Text
        style={{
          fontWeight: 'bold',
          color: 'gray',
          fontSize: 21,
          marginLeft: 18,
        }}>
        RAW Infrared Data Received
      </Text>
      <LineChart
        data={{
          datasets: [
            {
              data: ReduxStore.IR.slice(-25, -1),
            },
          ],
        }}
        width={Dimensions.get('window').width - 25} // from react-native
        height={220}
        // yAxisLabel={}
        chartConfig={{
          backgroundColor: '#1cc910',
          backgroundGradientFrom: '#eff3ff',
          backgroundGradientTo: '#efefef',
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 255) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </SafeAreaView>
  );
}

function mapStateToProps(state) {
  return {
    selectedCharacteristic: state.BLEs.selectedCharacteristic,
    IR: state.Data.IR,
    RD: state.Data.RD,
  };
}

const mapDispatchToProps = dispatch => ({
  writeCharacteristic: text => dispatch(writeCharacteristic(text)),
  writeRD: RD => dispatch(addRD(RD)),
  writeIR: IR => dispatch(addIR(IR)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  {forwardRef: true},
)(BLEReadcharacteristic);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 2,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 14,
  },
  subtext: {
    fontSize: 10,
  },
});
