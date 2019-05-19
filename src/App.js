// @flow

import React, { Component } from 'react'
import MainframeSDK, { type Contact } from '@mainframe/sdk'
import { Text, Row, Column, Button } from '@morpheus-ui/core'
import { Picker } from 'emoji-mart'

import 'emoji-mart/css/emoji-mart.css'
import './App.css'

type Props = {}

type State = {
  contacts?: Array<Contact>,
}

export default class App extends Component<Props, State> {
  sdk: MainframeSDK

  constructor() {
    super()
    this.sdk = new MainframeSDK()
    this.state = { contacts: [] }
  }

  async componentDidMount() {
    const contacts = await this.sdk.contacts.getApprovedContacts()
    contacts.forEach(c => this.fetchMood(c))
    this.setState({
      contacts,
    })
  }

  async fetchMood(contact) {
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
    const contact = await this.sdk.contacts.selectContact()
    if (
      !contact ||
      this.state.contacts.find(c => {
        return c.id === contact.id
      })
    ) {
      return
    }

    this.state.contacts.push(contact)
    await this.fetchMood(contact)
    this.forceUpdate()
  }

  setMood = async mood => {
    const timestamp = new Date().toUTCString()
    this.setState({ myMood: mood })
    await Promise.all(
      this.state.contacts.map(c => {
        return this.sdk.comms.publish(c.id, 'mood', { mood, timestamp })
      }),
    )
  }

  renderMood(name, mood, timestamp) {
    return (
      <Row size={3}>
        <Column>
          <Text>{name}</Text>
        </Column>
        <Column>
          <Text>{mood || '?'}</Text>
        </Column>
        <Column>
          <Text>{timestamp || 'never'}</Text>
        </Column>
      </Row>
    )
  }

  render() {
    return (
      <div>
        <Row size={3}>
          <Column>
            <Text>Name</Text>
          </Column>
          <Column>
            <Text>Current Mood</Text>
          </Column>
          <Column>
            <Text>Last Update</Text>
          </Column>
        </Row>
        {this.renderMood('Me', this.state.myMood, ' ')}
        {this.state.contacts &&
          this.state.contacts.map(c =>
            this.renderMood(c.data.profile.name, c.mood, c.timestamp),
          )}
        <Row size={1}>
          <Column>
            <Button title="Add Contact" onPress={this.selectContact} />
          </Column>
        </Row>
        <Row size={1}>
          <Column>
            <Picker
              title="My Mood"
              native={true}
              onSelect={e => this.setMood(e.native)}
            />
          </Column>
        </Row>
      </div>
    )
  }
}
