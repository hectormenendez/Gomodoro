import React from 'react';
import PropTypes from 'prop-types';
import { connect as Connect } from 'react-redux';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import { Button, Flex, SearchBar, List } from 'antd-mobile';
import Markdown from 'react-native-simple-markdown';

import ComponentLoading from '~/components/loading';
import { Actions as ActionsTodoist, Types as TypesTodoist } from '~/stores/todoist';
import { Actions as ActionsSelected, Types as TypesSelected } from '~/stores/selected';

import StyleProps from './style';

export const Style = StyleSheet.create(StyleProps);

export const State = {
    text: '',
    results: [],
};

export class Component extends React.Component {

    static name = 'Page.SelectItem';

    static propTypes = {
        todoist: TypesTodoist,
        selected: TypesSelected,
        dispatch: PropTypes.func.isRequired, // Added by redux-thunk
    };

    state = State;

    componentDidMount() {
        this.props.dispatch(ActionsTodoist.itemsFetch());
    }

    render () {

        if (!this.props.todoist.items.length) return <ComponentLoading/>;

        return <SafeAreaView style={Style.Container}>

            <Flex
                style={Style.ContainerFlex}
                direction="column"
                justify="between"
                align="start"
                wrap="nowrap">

                <View style={Style.ContainerTextArea}>
                    <SearchBar
                        value={this.state.text}
                        placeholder="Tasks"
                        maxLength={20}
                        onChange={this.onSearch.bind(this)}
                        onCancel={this.onCancel.bind(this)}
                    />
                    <List>
                        {this.state.results.map((result, i) =>
                            <List.Item
                                key={i}
                                onClick={this.onSelect.bind(this, i)}>
                                <Markdown>{result.content}</Markdown>
                            </List.Item>)
                        }
                    </List>
                </View>

                <View style={Style.ContainerContent}>
                    <Button type="ghost" onClick={this.onSync}>Full Sync</Button>
                </View>

            </Flex>

        </SafeAreaView>;
    }

    onSelect = (index) => {
        this.props.dispatch(ActionsSelected.setItem(this.state.results[index]));
        this.onCancel();
    }

    onSearch = (text) => {
        const { items } = this.props.todoist;
        if (text.length === 0) return this.onCancel();
        const results = items
            .filter(item => item.content.toLowerCase().indexOf(text.toLowerCase()) !== -1)
            .slice(0, 15);
        return this.setState({ text, results });
    }

    onSync = () => {
        this.setState(State);
        this.props.dispatch(ActionsTodoist.itemsReset());
    }

    onCancel = () => {
        this.setState(State);
        this.props.dispatch(ActionsTodoist.itemsFetch());
    }

}

// Connect and expose the store parts needed
export default Connect(
    store => ({
        todoist: store.todoist,
        selected: store.selected,
    }),
)(Component);
