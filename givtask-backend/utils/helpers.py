from flask import jsonify


def success(data=None, message='Success', status=200):
    """Standard success response."""
    body = {'success': True, 'message': message}
    if data is not None:
        body['data'] = data
    return jsonify(body), status


def error(message='An error occurred', status=400):
    """Standard error response."""
    return jsonify({'success': False, 'message': message}), status
