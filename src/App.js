// @flow

import React, { Component } from 'react'
import MainframeSDK from '@mainframe/sdk'
import Web3 from 'web3'

import { Text, Row, Column, ThemeProvider } from '@morpheus-ui/core'
import styled from 'styled-components/native'

import '@morpheus-ui/fonts'
import './App.css'

import LogoImg from './logo.svg'

import Theme from './theme'

type Props = {}

type State = {
  sdkWorking?: boolean,
  account?: string,
  ethBalance?: number,
}

const Container = styled.View`
  align-items: center;
  justify-content: center;
  padding: 20px;
  width: 100vw;
  height: 100vh;
  overflow: auto;
`

const Account = styled.View`
  align-items: center;
  justify-content: center;
  margin: 20px;
  border-color: grey;
  border-width: 1px;
`

const Logo = styled.Image``

export default class App extends Component<Props, State> {
  sdk: MainframeSDK
  web3: Web3

  state = {
    sdkWorking: false,
    account: '',
    ethBalance: 0,
  }

  constructor() {
    super()
    try {
      this.sdk = new MainframeSDK()
      this.web3 = new Web3(this.sdk.ethereum.web3Provider)
    } catch (e) {
      console.log(e)
    }
  }

  componentDidMount() {
    if (this.sdk && this.sdk.ethereum.web3Provider !== null) {
      this.setState({ sdkWorking: true })
      this.sdk.ethereum.on('accountsChanged', () => {
        this.fetchState()
      })
      this.sdk.ethereum.on('networkChanged', () => {
        this.fetchState()
      })
      this.fetchState()
    }
  }

  async fetchState() {
    const accounts = await this.web3.eth.getAccounts()
    if (accounts.length) {
      const account = accounts[0]
      const weiBalance = await this.web3.eth.getBalance(account)
      const ethBalance = this.web3.utils.fromWei(weiBalance)
      this.setState({
        account,
        ethBalance,
      })
    }
  }

  render() {
    return (
      <ThemeProvider theme={Theme}>
        <Container>
          <Row size={1}>
            <Column>
              <Text variant="center">
                <Logo
                  defaultSource={{
                    uri: LogoImg,
                    width: 200,
                    height: 60,
                  }}
                  resizeMode="contain"
                />
              </Text>
            </Column>
            <Column>
              <Text variant={['h2', 'center']}>
                MainframeSDK is {this.state.sdkWorking ? '' : 'NOT'} working!
              </Text>
            </Column>
          </Row>
          {this.state.sdkWorking && this.state.account ? (
            <Account>
              <Row size={2}>
                <Column>
                  <Text bold>Wallet address</Text>
                </Column>
                <Column>
                  <Text variant="ellipsis">{this.state.account}</Text>
                </Column>
              </Row>
              <Row size={2}>
                <Column>
                  <Text bold>ETH balance</Text>
                </Column>
                <Column>
                  <Text>{parseFloat(this.state.ethBalance).toFixed(8)}</Text>
                </Column>
              </Row>
            </Account>
          ) : null}
          <Row size={1}>
            <Column>
              <Text variant="center">
                Edit <Text variant="code">src/App.js</Text> and save to reload.
              </Text>
            </Column>
          </Row>
          <Row size={1}>
            <Column>
              <Text variant="center">
                Access{' '}
                <a href="https://mainframeos.com/developers">
                  <Text variant="code">mainframeos.com/developers</Text>
                </a>{' '}
                and learn to build on Mainframe.
              </Text>
            </Column>
          </Row>
        </Container>
      </ThemeProvider>
    )
  }
}
