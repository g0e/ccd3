<?php
header("Content-Disposition: attachment; filename=".$_POST["file_name"]);
header("Content-Type: text/csv;");
print($_POST["file_contents"]);

