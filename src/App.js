// @flow

import React, { Component } from 'react'
import MainframeSDK, { type Contact } from '@mainframe/sdk'
import { Text, Button } from '@morpheus-ui/core'
import styled from 'styled-components/native'
import { Picker } from 'emoji-mart'
import moment from 'moment'

import Logo from './logo.png'

import '@morpheus-ui/fonts'
import 'emoji-mart/css/emoji-mart.css'
import './App.css'

type Props = {}

type MoodContact = Contact & {
  mood?: ?string,
  timestamp?: ?string,
}

type State = {
  contacts: Array<MoodContact>,
  myMood?: ?string,
}

const DEFAULT_MOOD = '❔'

const Container = styled.View`
  flex: 1;
  flex-direction: row;
  width: 100vw;
  height: 100vh;
  background-color: #262626;
`

const MeContainer = styled.View`
  width: 400px;
  height: 100%;
  background-color: #1d1d1d;
`

const TopArea = styled.View`
  padding: 20px;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
`

const ContactsContainer = styled.View`
  flex: 1;
`

const MyMood = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`

const PickerContainer = styled.View`
  padding: 20px;
`

const ContactsMoodContainer = styled.View`
  flex: 1;
  padding: 10px;
  flex-direction: row;
  flex-wrap: wrap;
  overflow-y: auto;
`

const ContactMood = styled.View`
  width: 140px;
  height: 140px;
  padding: 20px 0;
  align-items: center;
  justify-content: space-around;
  background-color: #3a3a3a;
  border-radius: 10px;
  margin: 10px;
`

export default class App extends Component<Props, State> {
  sdk: MainframeSDK

  constructor() {
    super()
    this.sdk = new MainframeSDK()
    this.state = { contacts: [] }
  }

  async componentDidMount() {
    //$FlowFixMe
    const contacts = await this.sdk.contacts.getApprovedContacts()
    contacts.forEach(c => this.fetchMood(c))
    this.setState({
      contacts,
    })
  }

  async fetchMood(contact: MoodContact) {
    const keys = await this.sdk.comms.getSubscribable(contact.id)
    if (!keys.includes('mood')) {
      setTimeout(() => this.fetchMood(contact), 10000)
      return
    }

    const observable = await this.sdk.comms.subscribe(contact.id, 'mood')
    observable.subscribe(({ mood, timestamp }) => {
      contact.mood = mood
      contact.timestamp = timestamp
      this.forceUpdate()
    })
  }

  selectContact = async () => {
    //$FlowFixMe
    const contact = await this.sdk.contacts.selectContact()
    if (
      !contact ||
      this.state.contacts.find(c => {
        return c.id === contact.id
      })
    ) {
      return
    }

    //$FlowFixMe
    this.state.contacts.push(contact)
    await this.fetchMood(contact)
    this.forceUpdate()
  }

  setMood = async (mood: string) => {
    const timestamp = new Date().toUTCString()
    this.setState({ myMood: mood })
    await Promise.all(
      this.state.contacts.map(c => {
        return this.sdk.comms.publish(c.id, 'mood', { mood, timestamp })
      }),
    )
  }

  changeMood = () => this.setState({ myMood: null })

  renderMood = ({ id, data, mood, timestamp }: Object) => {
    return (
      <ContactMood key={id}>
        <Text size={60}>{mood || DEFAULT_MOOD}</Text>
        <Text color="white" size={15} bold>
          {data.profile.name}
        </Text>
        <Text color="white" size={10} italic>
          {timestamp ? moment(timestamp).format('LLL') : 'never'}
        </Text>
      </ContactMood>
    )
  }

  render() {
    return (
      <Container>
        <MeContainer>
          <TopArea>
            <img alt="My Mood" src={Logo} width={118} height={33} />
          </TopArea>
          <MyMood>
            {this.state.myMood ? (
              <>
                <Text color="white" bold size={20}>
                  My Mood
                </Text>
                <Text size={200}>{this.state.myMood}</Text>
                <Button
                  theme={ButtonStyles}
                  onPress={this.changeMood}
                  title="Change"
                />
              </>
            ) : (
              <>
                <Text color="white" bold size={20}>
                  {"What's "}your Mood?
                </Text>
                <PickerContainer>
                  <Picker
                    native={true}
                    emoji="grey_question"
                    onSelect={e => this.setMood(e.native)}
                  />
                </PickerContainer>
              </>
            )}
          </MyMood>
        </MeContainer>
        <ContactsContainer>
          <TopArea>
            <Text color="white" bold size={20}>
              My friends
            </Text>
            <Button
              theme={ButtonStyles}
              title="Add Contact"
              onPress={this.selectContact}
            />
          </TopArea>
          <ContactsMoodContainer>
            {this.state.contacts && this.state.contacts.map(this.renderMood)}
          </ContactsMoodContainer>
        </ContactsContainer>
      </Container>
    )
  }
}

const ButtonStyles = {
  backgroundColor: 'transparent',
  backgroundHoverColor: 'transparent',
  titleColor: 'white',
  borderColor: '#979797',
}
