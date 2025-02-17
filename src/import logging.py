import logging
import requests
import json
from behave import given, then, when, use_step_matcher
from expects import expect
from finops_service.features.steps import finops_fx_api
import utils.json_util as json_util
import utils.basic_api as basic_api
from finops_service.features.steps.finops_basic_api import send_request

log = logging.getLogger(__name__)

use_step_matcher("re")

# Helper function to fetch a payment method
def create_payment_method_with_signatures(context, signature_1, signature_2, bank_logo):
    try:
        request_body = json_util.get_json_object(
            "/finops_service/features/request_json/payment_method.json",
            'ach'.lower(),
            'valid'.lower()
        )
        request_body['paymentMethod']['signatureData'] = {
            'signature1Data': signature_1,
            'signature2Data': signature_2,
            'bankLogoData': bank_logo
        }
        context.storage['payment_method'] = request_body
        send_request(context, 'payment_method', 'from_storage')
        basic_api.get_status_code(context, 200, '')
        log.info("Created Payment Method with Signatures and Bank Logo")
        return context.storage['json_response']['paymentMethod']['id']
    except KeyError as e:
        log.error("Error creating payment method with signatures")
        raise e


# Helper function to create a transaction
def create_transaction(context, payment_method_id):
    try:
        request_body = json_util.get_json_object(
            "/finops_service/features/request_json/transaction.json",
            'vericast_check'.lower(),
            'valid_check'.lower()
        )
        request_body['transaction']['paymentMethod']['id'] = payment_method_id
        context.storage['transaction_payment'] = request_body
        send_request(context, 'transaction_payment', 'from_storage')
        basic_api.get_status_code(context, 200, '')
        log.info("Transaction created successfully")
    except KeyError as e:
        log.error("Error creating transaction")
        raise e

# Given step to create a check transaction with signature 1, 2, and bank logo
@given(r'I create a Check transaction with pay type "(?P<pay_type>.*)" and signatures "(?P<signature_1>.*)", "(?P<signature_2>.*)" and bank logo "(?P<bank_logo>.*)"')
def create_check_transaction(context, pay_type, signature_1, signature_2, bank_logo):
    try:
        payment_method_id = create_payment_method_with_signatures(context, signature_1, signature_2, bank_logo)
        create_transaction(context, payment_method_id)
    except KeyError as e:
        raise e

# When step to send the transaction request
@when(r'I send a transaction request with Signature 1, 2, and Bank Logo')
def send_transaction_request(context):
    try:
        send_request(context, 'transaction_payment', 'from_storage')
        basic_api.get_status_code(context, 200, '')
    except KeyError as e:
        log.error("Error sending transaction request")
        raise e

# Then step to verify the Bank Logo
@then(r'I verify that the Bank Logo is applied correctly')
def verify_bank_logo(context):
    try:
        assert 'bankLogoData' in context.storage['transaction_payment']['paymentMethod']['signatureData'], "Bank logo is missing"
        log.info("Bank Logo verified successfully")
    except AssertionError as e:
        log.error("Bank logo verification failed")
        raise e

@given(r'I create a Check transaction with pay type "(?P<pay_type>.*)" and signatures "(?P<signature_1>.*)", "(?P<signature_2>.*)" and bank logo "(?P<bank_logo>.*)"')


# Scenario for Amount limits
@given(r'I create a Transaction with amount "(?P<amount>.*)"')
def create_transaction_with_amount(context, amount):
    try:
        transaction_body = json_util.get_json_object(
            "/finops_service/features/request_json/transaction.json",
            'vericast_check'.lower(),
            'valid_check'.lower()
        )
        transaction_body['transaction']['amount'] = amount
        context.storage['transaction_payment'] = transaction_body
        send_request(context, 'transaction_payment', 'from_storage')
        basic_api.get_status_code(context, 200, '')
    except KeyError as e:
        log.error("Error creating transaction with amount")
        raise e

@then(r'I verify the appropriate message for amount "(?P<amount>.*)"')
def verify_amount_message(context, amount):
    try:
        response_message = context.storage['transaction_payment']['message']
        if amount < 0 or amount > 999999.99:
            expect(response_message).to.contain("Invalid amount")
        else:
            expect(response_message).to.contain("Transaction successful")
        log.info(f"Transaction message for amount {amount} verified successfully")
    except AssertionError as e:
        log.error("Amount message verification failed")
        raise e
