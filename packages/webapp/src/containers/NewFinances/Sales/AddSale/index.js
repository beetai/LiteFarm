import React, {Component} from "react";
import DateContainer from '../../../../components/Inputs/DateContainer';
import moment from 'moment';
import PageTitle from "../../../../components/PageTitle";
import {connect} from "react-redux";
import defaultStyles from '../../../Finances/styles.scss';
import {actions} from 'react-redux-form';
import SaleForm from "../../../../components/Forms/Sale";
import { getFieldCrops } from '../../../actions';
import { cropSelector as fieldCropSelector, farmSelector } from '../../../selector';
import {addOrUpdateSale} from "../../../Finances/actions";
import {convertToMetric, getUnit} from "../../../../util";
import {fetchFarmInfo} from "../../../actions";
import history from "../../../../history";

class AddSale extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: moment(),
      chosenOptions: [],
      quantity_unit: getUnit(this.props.farm, 'kg', 'lb'),
    };
    this.props.dispatch(actions.reset('financeReducer.forms.addSale'));
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChooseCrop = this.handleChooseCrop.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(getFieldCrops());
    this.props.dispatch(fetchFarmInfo(localStorage.getItem('farm_id')));
  }

  handleSubmit(sale) {
    const { dispatch } = this.props;
    const cropSale = this.state.chosenOptions.map((c) => {
      return {
        sale_value: sale[c.label].value && parseInt(sale[c.label].value, 10),
        quantity_kg: sale[c.label].quantity_kg && convertToMetric(parseInt(sale[c.label].quantity_kg), this.state.quantity_unit, 'kg'),
        field_crop_id: c.value
      }
    });
    const newSale = {
      customer_name: sale.name,
      sale_date: this.state.date,
      cropSale
    };
    dispatch(addOrUpdateSale(newSale));
    history.push('/newfinances/sales');

  }

  handleChooseCrop(option) {
    this.setState({
      chosenOptions: option
    })
  }

  render() {
    let fieldCrops = this.props.fieldCrops || [];
    const cropOptions = fieldCrops.map((fc) => {
      return { label: fc.crop_common_name, value: fc.field_crop_id }
    });
    return (
      <div className={defaultStyles.financesContainer}>
        <PageTitle backUrl='/newfinances' title='Add New Sale'/>
        <span className={defaultStyles.dateContainer}>
          <label>Date</label>
          <DateContainer
            style={defaultStyles.date}
            custom={true}
            date={this.state.date}
            onDateChange={(date) => this.setState({ date })}
          />
        </span>
        <SaleForm
          model="financeReducer.forms.addSale"
          cropOptions={cropOptions}
          onSubmit={this.handleSubmit}
          chosenOptions={this.state.chosenOptions}
          handleChooseCrop={this.handleChooseCrop}
          quantityUnit={this.state.quantity_unit}
          footerText={"Cancel"}
          footerOnClick={()=>history.push('/finances')}
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    fieldCrops: fieldCropSelector(state),
    farm: farmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(AddSale);
