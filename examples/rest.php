<?php

require '../bower_components/requirephp/require.php';

require '../bower_components/nymph/src/Nymph.php';
RPHP::_('NymphConfig', array(), function(){
	return include 'config.php';
});

$NymphREST = RPHP::_('NymphREST');

require 'Employee.php';

if (in_array($_SERVER['REQUEST_METHOD'], array('PUT', 'DELETE'))) {
	parse_str(file_get_contents("php://input"), $args);
	$NymphREST->run($_SERVER['REQUEST_METHOD'], $args['action'], $args['data']);
} else {
	$NymphREST->run($_SERVER['REQUEST_METHOD'], $_REQUEST['action'], $_REQUEST['data']);
}
