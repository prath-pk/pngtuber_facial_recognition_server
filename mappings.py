import operator

# Define operator mapping
ops = {
    '>=': operator.ge,
    '>': operator.gt,
    '<=': operator.le,
    '<': operator.lt,
    '==': operator.eq,
    '!=': operator.ne
}

def check_condition(expected_dict, actual_dict):
    all_met = all(
        ops[op](actual_dict.get(key, 0), threshold)
        for key, (op, threshold) in expected_dict.items()
    )
    return all_met

# import operator

# expected_out_dict = {
#     'd': [operator.ge, 0.4],
#     'e': [operator.gt, 0.6],
#     'f': [operator.le, 0.2]
# }

# actual_output_dict = {'a': 0.0, 'b': 0.1, 'c': 0.0, 'd': 0.4, 'e': 0.7, 'f': 0.1, 'g': 0.0, 'h': 0.4}

# # Check if all expectations are met
# all_met = all(
#     op_func(actual_output_dict.get(key, 0), threshold)
#     for key, (op_func, threshold) in expected_out_dict.items()
# )
# print(f"All expectations met: {all_met}")