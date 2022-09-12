import apm from '../rum'
import React, { Component } from 'react';
import { SERVER_URL } from '../constants.js'
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'
import AddCar from './AddCar.js';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';

class Carlist extends Component {
    constructor(props) {
        super(props);
        this.state = { cars: [], open: false, message: '' };
    }

    // Add new car
    addCar(car) {
        // Add car metadata as labels to the RUM click transaction
        var transaction = apm.startTransaction("Add Car", "Car");
        transaction.addLabels(car);

        fetch(SERVER_URL + 'api/cars',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(car)
            })
            .then(res => { 
                this.fetchCars();
            })
            .catch(err => console.error(err))
        
        transaction.end();
    }

    fetchCars = () => {
        fetch(SERVER_URL + 'api/cars')
            .then((response) => response.json())
            .then((responseData) => {
                this.setState({
                    cars: responseData._embedded.cars,
                });
            })
            .catch(err => console.error(err));

    }
       
    renderEditable = (cellInfo) => {
        return (
            <div
                style={{ backgroundColor: "#fafafa" }}
                contentEditable
                suppressContentEditableWarning
                onBlur={e => {
                    const data = [...this.state.cars];
                    data[cellInfo.index][cellInfo.column.id] =
                        e.target.innerHTML;
                    this.setState({ cars: data });
                }}
                dangerouslySetInnerHTML={{
                    __html: this.state.cars[cellInfo.index][cellInfo.column.id]
                }}
            />);
    }

    // Delete car
    onDelClick = (link) => {
        fetch(link, { method: 'DELETE' })
            .then(res => {
                this.setState({ open: true, message: 'Car deleted' });
                this.fetchCars();
            })
            .catch(err => {
                this.setState({ open: true, message: 'Error when deleting' });
                console.error(err)
            })
    }

    // Update car
    updateCar(car, link) {
        fetch(link,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(car)
            })
            .then(res =>
                this.setState({ open: true, message: 'Changes saved' })
            )
            .catch(err =>
                this.setState({ open: true, message: 'Error when saving' })
            )
    }

    componentDidMount() {
        this.fetchCars();
    }

    generateError() {
        const err = new Error("This is an error generated on purpose for testing!");
        throw err;
    }

    confirmDelete = (link) => {
        confirmAlert({
            message: 'Are you sure to delete?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => this.onDelClick(link)
                },
                {
                    label: 'No',
                }]
        })
    }

    render() {
        const columns = [{
            Header: 'Brand',
            accessor: 'brand',
            Cell: this.renderEditable
        }, {
            Header: 'Model',
            accessor: 'model',
            Cell: this.renderEditable
        }, {
            Header: 'Color',
            accessor: 'color',
            Cell: this.renderEditable
        }, {
            Header: 'Year',
            accessor: 'year',
            Cell: this.renderEditable
        }, {
            Header: 'Price $',
            accessor: 'price',
            Cell: this.renderEditable
        }, {
            id: 'savebutton',
            sortable: false,
            filterable: false,
            width: 100,
            accessor: '_links.self.href',
            Cell: ({ value, row }) => (<Button size="small" variant="text"
                color="primary"
                onClick={() => { this.updateCar(row, value) }}>Save</Button>)
        }, {
            id: 'delbutton',
            sortable: false,
            filterable: false,
            width: 100,
            accessor: '_links.self.href',
            Cell: ({ value }) => (<Button size="small" variant="text" color="secondary"
                onClick={() => { this.confirmDelete(value) }}>Delete</Button>)
        }]

        // Carlist.js render() method's return statement
        return (
            <div className="App">
                <Grid container>
                    <Grid item>
                        <AddCar addCar={this.addCar} fetchCars={this.fetchCars} />
                    </Grid>
                    <Grid>
                        <Button variant="contained" color="secondary"
                            style={{ 'margin': '10px' }}
                            onClick={() => { this.generateError() }}>Error</Button>
                    </Grid>
                </Grid>
                <ReactTable data={this.state.cars} columns={columns}
                    filterable={true} pageSize={10} />
                <Snackbar
                    style={{ width: 300, color: 'green' }}
                    open={this.state.open} onClose={this.handleClose}
                    autoHideDuration={1500} message={this.state.message} />
            </div>
        );
    }
    handleClose = (event, reason) => {
        this.setState({ open: false });
    };

}
export default Carlist;