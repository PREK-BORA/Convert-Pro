"""Reserved plugin entry point. The ConvertPro backend does not enable this Python converter yet.
The live set of supported conversions is declared in shared/conversionTypes.js.
"""

def convert(*args, **kwargs):
    raise NotImplementedError("This converter is not configured in this installation.")
