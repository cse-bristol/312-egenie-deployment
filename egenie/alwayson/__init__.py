
""" Always On screen that can be included as part of the 'carousel'. 
Displays the baseline energy use in a calendar form, using the sd_store baseline calculation
and a single sensor. There is a (very bespoke) management command as part of eGenie
that can aggregate multiple electricity sensors into a single one to use with this screen.

.. warning:: The sensor to be displayed is currently hardcoded. This should become a configuration option.
"""