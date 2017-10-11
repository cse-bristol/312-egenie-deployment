"""
Provides the ability to manage a :class:`~deployments.models.Deployment`. In essence, the physical building at which eGenie is deployed. This includes the physical address, a picture of the location, the hub which is present in the building to collect data, and additional data (such as energy costs and extra notes).

A Deployment has one of four states: Incomplete (not yet ready to be put 'live'); Not Running; Running; and Ended. Once a Deployment is ended, an 'end date' is stored in its :class:`~deployments.models.DeploymentState` so the correct readings are returned
at any given time. If a sensor is restarted, previous readings are cleared.

.. seealso:: :class:`~sensors.models.SensorDeploymentDetails`

"""