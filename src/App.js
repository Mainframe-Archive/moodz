// @flow

import React, { Component } from 'react'
import MainframeSDK from '@mainframe/sdk'
import { Text } from '@morpheus-ui/core'

import './App.css'

type Props = {}

type State = {}

export default class App extends Component<Props, State> {
  sdk: MainframeSDK

  constructor() {
    super()
    this.sdk = new MainframeSDK()
  }

  render() {
    return <Text>It works!</Text>
  }
}
