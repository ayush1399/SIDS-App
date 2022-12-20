#!/bin/sh
DIR="node_modules"

if [ -d "$DIR" ]; then
  echo "fixing react files in ${DIR}..."
else
  echo "missing node_modules folder, are you running this script from the correct path?"
  exit 1
fi

TARGET_FILE="./node_modules/react-native/React/CxxBridge/RCTCxxBridge.mm"
FROM="_initializeModules:(NSArray<id<RCTBridgeModule>>\ \*)modules"
TO="_initializeModules:(NSArray<Class>\ \*)modules"
sed -i -e "s/$FROM/$TO/g" $TARGET_FILE

TARGET_FILE="./node_modules/react-native/ReactCommon/turbomodule/core/platform/iOS/RCTTurboModuleManager.mm"
FROM="RCTBridgeModuleNameForClass(module))"
TO="RCTBridgeModuleNameForClass(Class(module)))"
sed -i -e "s/$FROM/$TO/g" $TARGET_FILE

echo "Yay! RCTCxxBridge.mm and RCTTurboModuleManager.mm should be fixed now."
